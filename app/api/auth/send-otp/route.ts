// import { NextRequest, NextResponse } from 'next/server';
// import dbConnect from '@/lib/mongodb';
// import { sendOTP, generateOTP } from '@/lib/sms';

// export const dynamic = 'force-dynamic';

// let otpStore: { [key: string]: { otp: string; timestamp: number } } = {};

// export async function POST(request: NextRequest) {
//   try {
//     const { phone } = await request.json();

//     if (!phone) {
//       return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
//     }

//     await dbConnect();

//     const otp = generateOTP();
//     const timestamp = Date.now();

//     // Store OTP with timestamp (expires in 5 minutes)
//     otpStore[phone] = { otp, timestamp };

//     // Clean up expired OTPs
//     Object.keys(otpStore).forEach(key => {
//       if (Date.now() - otpStore[key].timestamp > 5 * 60 * 1000) {
//         delete otpStore[key];
//       }
//     });

//     const sent = await sendOTP(phone, otp);

//     if (sent) {
//       return NextResponse.json({ success: true, message: 'OTP sent successfully' });
//     } else {
//       return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
//     }
//   } catch (error) {
//     console.error('Error sending OTP:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

// export { otpStore };

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

    await dbConnect();

    // Find user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Generate OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
    await user.save();

    // Send OTP via SMS API
    const smsRes = await fetch(
      `${process.env.SMS_BASE_URL}?API=${encodeURIComponent(
        process.env.SMS_API_KEY!
      )}&PHONE=${encodeURIComponent(phone)}&OTP=${encodeURIComponent(otp)}`
    );
    const smsText = await smsRes.text();

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      smsText,
    });
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
