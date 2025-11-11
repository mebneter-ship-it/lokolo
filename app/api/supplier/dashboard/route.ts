// app/api/supplier/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

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

    // Get total businesses count
    const totalQuery = `
      SELECT COUNT(*) as count
      FROM businesses
      WHERE user_id = $1
      AND is_active = true
    `;
    const totalResult = await pool.query(totalQuery, [user_id]);
    const totalBusinesses = parseInt(totalResult.rows[0]?.count || '0');

    // Get verified businesses count
    const verifiedQuery = `
      SELECT COUNT(*) as count
      FROM businesses
      WHERE user_id = $1
      AND verification_status = 'verified'
      AND is_active = true
    `;
    const verifiedResult = await pool.query(verifiedQuery, [user_id]);
    const verifiedBusinesses = parseInt(verifiedResult.rows[0]?.count || '0');

    // Get pending businesses count
    const pendingQuery = `
      SELECT COUNT(*) as count
      FROM businesses
      WHERE user_id = $1
      AND verification_status = 'pending'
      AND is_active = true
    `;
    const pendingResult = await pool.query(pendingQuery, [user_id]);
    const pendingBusinesses = parseInt(pendingResult.rows[0]?.count || '0');

    // Get total favorites count across all businesses
    const favoritesQuery = `
      SELECT COUNT(*) as count
      FROM favorites f
      INNER JOIN businesses b ON f.business_id = b.id
      WHERE b.user_id = $1
      AND b.is_active = true
    `;
    const favoritesResult = await pool.query(favoritesQuery, [user_id]);
    const totalFavorites = parseInt(favoritesResult.rows[0]?.count || '0');

    return NextResponse.json({
      success: true,
      totalBusinesses,
      verifiedBusinesses,
      pendingBusinesses,
      totalFavorites
    });

  } catch (error: any) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
