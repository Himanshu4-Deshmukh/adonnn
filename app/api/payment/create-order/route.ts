import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { amount, itemId, itemType } = await request.json();

    if (!amount || !itemId || !itemType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const options = {
      amount: amount * 100, // amount in smallest currency unit
      currency: 'INR',
      receipt: `${itemType}_${itemId}_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error creating payment order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}