// app/api/consumer/favorites/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Fetch all favorites for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing user_id parameter' },
        { status: 400 }
      );
    }

    const query = `
      SELECT 
        b.id,
        b.business_name,
        b.slug,
        b.category,
        b.city,
        b.latitude,
        b.longitude,
        b.verification_status,
        f.created_at as favorited_at
      FROM favorites f
      INNER JOIN businesses b ON f.business_id = b.id
      WHERE f.user_id = $1
      AND b.is_active = true
      ORDER BY f.created_at DESC
    `;

    const { rows } = await pool.query(query, [user_id]);

    return NextResponse.json({ 
      success: true, 
      favorites: rows 
    });

  } catch (error: any) {
    console.error('Favorites GET error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch favorites',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// POST - Add a favorite
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, business_id } = body;

    if (!user_id || !business_id) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, business_id' },
        { status: 400 }
      );
    }

    // Check if already favorited
    const checkQuery = `
      SELECT id FROM favorites
      WHERE user_id = $1 AND business_id = $2
    `;
    const checkResult = await pool.query(checkQuery, [user_id, business_id]);

    if (checkResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Business already in favorites' },
        { status: 400 }
      );
    }

    // Add to favorites
    const insertQuery = `
      INSERT INTO favorites (user_id, business_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    const { rows } = await pool.query(insertQuery, [user_id, business_id]);

    return NextResponse.json({ 
      success: true, 
      favorite: rows[0] 
    });

  } catch (error: any) {
    console.error('Favorites POST error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to add favorite',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove a favorite
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const business_id = searchParams.get('business_id');

    if (!user_id || !business_id) {
      return NextResponse.json(
        { error: 'Missing required parameters: user_id, business_id' },
        { status: 400 }
      );
    }

    const deleteQuery = `
      DELETE FROM favorites
      WHERE user_id = $1 AND business_id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(deleteQuery, [user_id, business_id]);

    return NextResponse.json({ 
      success: true,
      deleted: rows.length > 0 
    });

  } catch (error: any) {
    console.error('Favorites DELETE error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to remove favorite',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
