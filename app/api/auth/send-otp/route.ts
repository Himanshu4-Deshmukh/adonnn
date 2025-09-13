import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Validate phone number format (10 digits)
    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit phone number" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Check if user exists
    let user = await User.findOne({ phone });
    let isNewUser = false;

    if (!user) {
      // Create new user with OTP (registration will be completed after OTP verification)
      user = new User({
        phone,
        otp,
        otpExpires,
        isVerified: false,
      });
      isNewUser = true;
    } else {
      // Update existing user with new OTP
      user.otp = otp;
      user.otpExpires = otpExpires;
    }

    await user.save();

    // Send SMS using Renflair API
    try {
      const smsUrl = `${process.env.SMS_BASE_URL}?API=${encodeURIComponent(
        process.env.SMS_API_KEY!
      )}&PHONE=${encodeURIComponent(phone)}&OTP=${encodeURIComponent(otp)}`;

      console.log('Sending SMS to:', phone, 'with OTP:', otp);
      
      const smsResponse = await fetch(smsUrl);
      const smsText = await smsResponse.text();
      
      console.log('SMS API Response:', smsText);

      // Check if SMS was sent successfully
      if (!smsResponse.ok) {
        console.error('SMS API Error:', smsText);
        // Don't fail the request if SMS fails, but log it
      }

      return NextResponse.json({
        success: true,
        message: "OTP sent successfully",
        isNewUser,
        // Include SMS response for debugging (remove in production)
        smsResponse: smsText
      });

    } catch (smsError) {
      console.error('SMS sending error:', smsError);
      
      // Still return success but note the SMS issue
      return NextResponse.json({
        success: true,
        message: "OTP generated but SMS delivery may have failed",
        isNewUser,
        warning: "SMS service temporarily unavailable",
        // For development - show OTP in response (remove in production)
        developmentOtp: otp
      });
    }

  } catch (error: any) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}