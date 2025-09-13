import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Ad from '@/models/Ad';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const category = searchParams.get('category');

    let query: any = {};
    if (location && location !== 'all') {
      query.location = location;
    }
    if (category && category !== 'all') {
      query.category = category;
    }

    const ads = await Ad.find(query)
      .populate('createdBy', 'name phone')
      .sort({ isPromoted: -1, createdAt: -1 })
      .limit(50);

    return NextResponse.json({ ads });
  } catch (error) {
    console.error('Error fetching ads:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    const body = await request.json();
    const { title, description, shortDescription, location, category, price, images, contact } = body;

    if (!title || !description || !shortDescription || !location || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    const ad = new Ad({
      title,
      description,
      shortDescription,
      location,
      category,
      price: price || 0,
      images: images || [],
      contact,
      createdBy: decoded.userId,
    });

    await ad.save();
    await ad.populate('createdBy', 'name phone');

    return NextResponse.json({ ad }, { status: 201 });
  } catch (error) {
    console.error('Error creating ad:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}