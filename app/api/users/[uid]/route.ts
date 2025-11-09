import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

interface RouteParams {
  params: Promise<{
    uid: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { uid } = await context.params;

    if (!uid) {
      return NextResponse.json(
        { success: false, error: 'User UID is required' },
        { status: 400 }
      );
    }

    // Get user from database by Firebase UID
    const result = await pool.query(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [uid]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Get user API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { uid } = await context.params;
    const body = await request.json();
    const { full_name } = body;

    if (!uid) {
      return NextResponse.json(
        { success: false, error: 'User UID is required' },
        { status: 400 }
      );
    }

    // Update user in database
    const result = await pool.query(
      `UPDATE users 
       SET full_name = $1, updated_at = NOW()
       WHERE firebase_uid = $2
       RETURNING *`,
      [full_name, uid]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: result.rows[0],
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update user API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
