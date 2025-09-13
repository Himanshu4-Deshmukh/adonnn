import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { otpStore } from '../send-otp/route';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { phone, otp, name, location } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 });
    }

    // Check if OTP exists and is valid
    const storedOtpData = otpStore[phone];
    if (!storedOtpData) {
      return NextResponse.json({ error: 'OTP not found or expired' }, { status: 400 });
    }

    // Check if OTP is expired (5 minutes)
    if (Date.now() - storedOtpData.timestamp > 5 * 60 * 1000) {
      delete otpStore[phone];
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
    }

    // Check if OTP matches
    if (storedOtpData.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    await dbConnect();

    // Check if user exists
    let user = await User.findOne({ phone });

    if (!user) {
      // Create new user
      if (!name || !location) {
        return NextResponse.json({ error: 'Name and location are required for new users' }, { status: 400 });
      }

      user = new User({
        phone,
        name,
        location,
        isVerified: true,
      });
      await user.save();
    } else {
      // Update existing user
      user.isVerified = true;
      user.lastLogin = new Date();
      await user.save();
    }

    // Clean up used OTP
    delete otpStore[phone];

    // Generate JWT token
    const token = generateToken(user._id.toString());

    const response = NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        location: user.location,
      },
    });

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}