import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { phone, otp, name, location } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json({ 
        success: false, 
        error: 'Phone and OTP are required' 
      }, { status: 400 });
    }

    // Validate phone number format
    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json({
        success: false,
        error: 'Please enter a valid 10-digit phone number'
      }, { status: 400 });
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({
        success: false,
        error: 'Please enter a valid 6-digit OTP'
      }, { status: 400 });
    }

    await dbConnect();

    // Find user with phone and valid OTP
    const user = await User.findOne({ phone });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found. Please request a new OTP.' 
      }, { status: 404 });
    }

    // Check if OTP matches
    if (!user.otp || user.otp !== otp) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid OTP. Please check and try again.' 
      }, { status: 400 });
    }

    // Check if OTP has expired
    if (!user.otpExpires || user.otpExpires < new Date()) {
      return NextResponse.json({ 
        success: false, 
        error: 'OTP has expired. Please request a new one.' 
      }, { status: 400 });
    }

    // Check if this is a new user (needs registration)
    const isNewUser = !user.name || !user.location;

    if (isNewUser) {
      // New user registration - require name and location
      if (!name || !location) {
        return NextResponse.json({ 
          success: false, 
          error: 'Name and location are required for new users',
          requiresRegistration: true
        }, { status: 400 });
      }

      // Complete user registration
      user.name = name.trim();
      user.location = location.trim();
    }

    // Clear OTP and mark as verified
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    user.lastLogin = new Date();

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id.toString());

    const response = NextResponse.json({
      success: true,
      message: isNewUser ? 'Registration successful' : 'Login successful',
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
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}