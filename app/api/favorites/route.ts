import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - List all favorites for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get all favorited businesses with their details
    const result = await pool.query(
      `SELECT 
        f.id as favorite_id,
        f.created_at as favorited_at,
        b.*,
        (SELECT photo_url FROM business_photos 
         WHERE business_id = b.id AND is_primary = true 
         LIMIT 1) as cover_photo
      FROM favorites f
      JOIN businesses b ON f.business_id = b.id
      WHERE f.user_id = $1
      AND b.is_active = true
      ORDER BY f.created_at DESC`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      favorites: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Get favorites error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get favorites',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Add a business to favorites
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, business_id } = body;

    if (!user_id || !business_id) {
      return NextResponse.json(
        { success: false, error: 'User ID and Business ID are required' },
        { status: 400 }
      );
    }

    // Check if already favorited
    const existing = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND business_id = $2',
      [user_id, business_id]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Business already in favorites' },
        { status: 400 }
      );
    }

    // Add to favorites
    const result = await pool.query(
      `INSERT INTO favorites (user_id, business_id)
       VALUES ($1, $2)
       RETURNING *`,
      [user_id, business_id]
    );

    return NextResponse.json({
      success: true,
      favorite: result.rows[0],
      message: 'Added to favorites'
    });

  } catch (error) {
    console.error('Add favorite error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to add favorite',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove a business from favorites
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const businessId = searchParams.get('business_id');

    if (!userId || !businessId) {
      return NextResponse.json(
        { success: false, error: 'User ID and Business ID are required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND business_id = $2 RETURNING *',
      [userId, businessId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Favorite not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Removed from favorites'
    });

  } catch (error) {
    console.error('Remove favorite error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to remove favorite',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
