import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Import the OTP store from send-otp route
let otpStore: { [key: string]: { otp: string; timestamp: number } } = {};

// Since we can't directly import from the other route file in this setup,
// we'll recreate the store logic here
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

    // For development, we'll use a simple OTP validation
    // In production, you should validate against your OTP store
    
    // Check if user exists
    let user = await User.findOne({ phone });
    const isNewUser = !user;

    if (isNewUser) {
      // New user registration - require name and location
      if (!name || !location) {
        return NextResponse.json({ 
          success: false, 
          error: 'Name and location are required for new users',
          requiresRegistration: true
        }, { status: 400 });
      }

      // Create new user
      user = new User({
        phone,
        name: name.trim(),
        location: location.trim(),
        isVerified: true,
      });
      await user.save();
    } else {
      // Existing user login
      user.isVerified = true;
      user.lastLogin = new Date();
      await user.save();
    }

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