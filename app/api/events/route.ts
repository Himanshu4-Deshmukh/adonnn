import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
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

    const events = await Event.find(query)
      .populate('createdBy', 'name phone')
      .sort({ isPromoted: -1, eventDate: 1 })
      .limit(50);

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
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
    const { title, description, shortDescription, location, category, eventDate, eventTime, venue, images, contact } = body;

    if (!title || !description || !shortDescription || !location || !category || !eventDate || !eventTime || !venue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    const event = new Event({
      title,
      description,
      shortDescription,
      location,
      category,
      eventDate,
      eventTime,
      venue,
      images: images || [],
      contact,
      createdBy: decoded.userId,
    });

    await event.save();
    await event.populate('createdBy', 'name phone');

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}