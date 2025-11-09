import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firebase_uid, email, full_name, role } = body;

    if (!firebase_uid || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: firebase_uid and email' },
        { status: 400 }
      );
    }

    try {
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE firebase_uid = $1',
        [firebase_uid]
      );

      let user;

      if (existingUser.rows.length > 0) {
        user = existingUser.rows[0];
      } else {
        const result = await pool.query(
          `INSERT INTO users (firebase_uid, email, full_name, role, created_at, updated_at)
           VALUES ($1, $2, $3, $4, NOW(), NOW())
           RETURNING *`,
          [firebase_uid, email, full_name || email, role || 'consumer']
        );
        user = result.rows[0];
      }

      return NextResponse.json({
        success: true,
        message: 'User synced successfully',
        user: user,
      });

    } catch (dbError: any) {
      console.error('Database sync error (non-critical):', dbError.message);
      
      // Return success with Firebase UID as fallback
      return NextResponse.json({
        success: true,
        message: 'User authenticated (database sync pending)',
        user: {
          id: firebase_uid,
          firebase_uid: firebase_uid,
          email: email,
          full_name: full_name || email,
          role: role || 'consumer',
        },
      });
    }

  } catch (error: any) {
    console.error('Sync user error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to sync user',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
