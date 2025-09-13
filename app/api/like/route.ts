import { NextRequest, NextResponse } from 'next/server';
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

    const { itemId, type } = await request.json();

    if (!itemId || !type) {
      return NextResponse.json({ error: 'Item ID and type are required' }, { status: 400 });
    }

    await dbConnect();

    const Model = type === 'ad' ? Ad : Event;
    const item = await Model.findById(itemId);

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const userLiked = item.likes.includes(decoded.userId);

    if (userLiked) {
      item.likes = item.likes.filter((id: any) => id.toString() !== decoded.userId);
    } else {
      item.likes.push(decoded.userId);
    }

    await item.save();

    return NextResponse.json({ 
      liked: !userLiked, 
      likesCount: item.likes.length 
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}