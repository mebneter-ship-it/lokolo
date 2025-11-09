import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT NOW() as current_time, current_database() as database');
    
    return NextResponse.json({
      status: 'connected',
      timestamp: result.rows[0].current_time,
      database: result.rows[0].database,
      message: 'Database connection successful'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Database test error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
      code: error.code
    }, { status: 500 });
  }
}
