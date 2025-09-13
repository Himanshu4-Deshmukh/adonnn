import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Ad from '@/models/Ad';
import Event from '@/models/Event';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, itemId, itemType, promotionDays } = await request.json();

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    await dbConnect();

    // Update item to promoted status
    const Model = itemType === 'ad' ? Ad : Event;
    const promotedUntil = new Date();
    promotedUntil.setDate(promotedUntil.getDate() + (promotionDays || 7));

    await Model.findByIdAndUpdate(itemId, {
      isPromoted: true,
      promotedUntil,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}