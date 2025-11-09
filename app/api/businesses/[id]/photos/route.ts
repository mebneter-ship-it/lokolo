import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const result = await pool.query(
      `SELECT * FROM business_photos 
       WHERE business_id = $1 
       ORDER BY is_primary DESC, created_at ASC`,
      [id]
    );

    return NextResponse.json({
      success: true,
      photos: result.rows,
    });

  } catch (error: any) {
    console.error('Fetch photos error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch photos',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
