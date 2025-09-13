import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// In-memory OTP store (in production, use Redis or database)
const otpStore: { [key: string]: { otp: string; timestamp: number } } = {};

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

    // Generate OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const timestamp = Date.now();

    // Store OTP in memory (expires in 5 minutes)
    otpStore[phone] = { otp, timestamp };

    // Clean up expired OTPs
    Object.keys(otpStore).forEach(key => {
      if (Date.now() - otpStore[key].timestamp > 5 * 60 * 1000) {
        delete otpStore[key];
      }
    });

    console.log(`OTP for ${phone}: ${otp}`); // For development - remove in production

    // In development, we'll skip actual SMS sending
    // In production, uncomment and configure SMS service
    /*
    try {
      const smsRes = await fetch(
        `${process.env.SMS_BASE_URL}?API=${encodeURIComponent(
          process.env.SMS_API_KEY!
        )}&PHONE=${encodeURIComponent(phone)}&OTP=${encodeURIComponent(otp)}`
      );
      const smsText = await smsRes.text();
      console.log('SMS Response:', smsText);
    } catch (smsError) {
      console.error('SMS Error:', smsError);
      // Continue anyway for development
    }
    */

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      // Remove this in production
      developmentOtp: otp
    });
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// Export the OTP store for use in verify-otp
export { otpStore };