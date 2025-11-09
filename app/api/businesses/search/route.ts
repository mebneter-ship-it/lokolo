import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const radius = searchParams.get('radius') || '10000'; // Default 10km in meters
    const category = searchParams.get('category');
    const searchTerm = searchParams.get('search');

    // Validate required parameters
    if (!latitude || !longitude) {
      return NextResponse.json(
        { success: false, error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusMeters = parseInt(radius);

    if (isNaN(lat) || isNaN(lng) || isNaN(radiusMeters)) {
      return NextResponse.json(
        { success: false, error: 'Invalid coordinates or radius' },
        { status: 400 }
      );
    }

    // Build the query with PostGIS distance calculation
    let query = `
      SELECT 
        b.*,
        ST_Distance(
          ST_MakePoint($1, $2)::geography,
          ST_MakePoint(b.longitude, b.latitude)::geography
        ) / 1000 as distance_km,
        (SELECT photo_url 
         FROM business_photos 
         WHERE business_id = b.id AND is_primary = true 
         LIMIT 1) as cover_photo
      FROM businesses b
      WHERE 
        b.is_active = true
        AND b.verification_status = 'verified'
        AND b.latitude IS NOT NULL
        AND b.longitude IS NOT NULL
        AND ST_DWithin(
          ST_MakePoint($1, $2)::geography,
          ST_MakePoint(b.longitude, b.latitude)::geography,
          $3
        )
    `;

    const params: any[] = [lng, lat, radiusMeters];
    let paramIndex = 4;

    // Add category filter if provided
    if (category && category !== 'All Categories') {
      query += ` AND b.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    // Add search term filter if provided
    if (searchTerm) {
      query += ` AND (
        b.business_name ILIKE $${paramIndex}
        OR b.description ILIKE $${paramIndex}
        OR b.category ILIKE $${paramIndex}
        OR b.city ILIKE $${paramIndex}
      )`;
      params.push(`%${searchTerm}%`);
      paramIndex++;
    }

    // Order by distance and limit results
    query += ` ORDER BY distance_km ASC LIMIT 50`;

    const result = await pool.query(query, params);

    return NextResponse.json({
      success: true,
      businesses: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to search businesses',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
