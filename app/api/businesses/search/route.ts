import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// Mock data for local development when DB is not available
const MOCK_BUSINESSES = [
  {
    id: 'mock-1',
    business_name: 'Ubuntu Coffee Shop',
    category: 'Coffee Shop',
    description: 'Authentic African coffee experience',
    latitude: -26.2041,
    longitude: 28.0473,
    address_formatted: '123 Nelson Mandela Square, Sandton',
    city: 'Johannesburg',
    phone: '+27 11 123 4567',
    email: 'info@ubuntucoffee.co.za',
    whatsapp_number: '+27711234567',
    verification_status: 'verified',
    is_active: true,
    distance_km: 0.5
  },
  {
    id: 'mock-2',
    business_name: 'Kasi Kitchen',
    category: 'Restaurant',
    description: 'Traditional South African cuisine',
    latitude: -26.1950,
    longitude: 28.0550,
    address_formatted: '45 Vilakazi Street, Soweto',
    city: 'Johannesburg',
    phone: '+27 11 234 5678',
    email: 'hello@kasikitchen.co.za',
    whatsapp_number: '+27712345678',
    verification_status: 'verified',
    is_active: true,
    distance_km: 1.2
  },
  {
    id: 'mock-3',
    business_name: 'Afro Hair Salon',
    category: 'Beauty Salon',
    description: 'Specializing in natural hair care',
    latitude: -26.2100,
    longitude: 28.0400,
    address_formatted: '78 Rosebank Mall, Rosebank',
    city: 'Johannesburg',
    phone: '+27 11 345 6789',
    email: 'bookings@afrohair.co.za',
    whatsapp_number: '+27713456789',
    verification_status: 'verified',
    is_active: true,
    distance_km: 2.3
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { latitude, longitude, radius = 50 } = body;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { success: false, error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    try {
      // Try to query the database
      const query = `
        SELECT 
          id::text,
          business_name,
          category,
          description,
          latitude,
          longitude,
          address_formatted,
          city,
          phone,
          email,
          whatsapp_number,
          verification_status,
          is_active,
          created_at,
          ST_Distance(
            ST_MakePoint(longitude, latitude)::geography,
            ST_MakePoint($2, $1)::geography
          ) / 1000 as distance_km
        FROM businesses
        WHERE 
          is_active = true
          AND verification_status = 'verified'
          AND ST_DWithin(
            ST_MakePoint(longitude, latitude)::geography,
            ST_MakePoint($2, $1)::geography,
            $3 * 1000
          )
        ORDER BY distance_km ASC
        LIMIT 100
      `;

      const result = await pool.query(query, [latitude, longitude, radius]);

      return NextResponse.json({
        success: true,
        businesses: result.rows,
        count: result.rows.length,
        source: 'database'
      });

    } catch (dbError) {
      console.warn('Database not available, using mock data for development:', dbError);
      
      // Return mock data for local development
      return NextResponse.json({
        success: true,
        businesses: MOCK_BUSINESSES,
        count: MOCK_BUSINESSES.length,
        source: 'mock',
        note: 'Using mock data - database not available. This is normal for local development.'
      });
    }

  } catch (error) {
    console.error('Error searching businesses:', error);
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

// Also support GET requests for simpler testing
export async function GET(request: NextRequest) {
  try {
    try {
      // Try to query the database
      const query = `
        SELECT 
          id::text,
          business_name,
          category,
          description,
          latitude,
          longitude,
          address_formatted,
          city,
          phone,
          email,
          whatsapp_number,
          verification_status,
          is_active,
          created_at
        FROM businesses
        WHERE 
          is_active = true
          AND verification_status = 'verified'
        ORDER BY created_at DESC
        LIMIT 100
      `;

      const result = await pool.query(query);

      return NextResponse.json({
        success: true,
        businesses: result.rows,
        count: result.rows.length,
        source: 'database'
      });

    } catch (dbError) {
      console.warn('Database not available, using mock data for development:', dbError);
      
      // Return mock data for local development
      return NextResponse.json({
        success: true,
        businesses: MOCK_BUSINESSES,
        count: MOCK_BUSINESSES.length,
        source: 'mock',
        note: 'Using mock data - database not available. This is normal for local development.'
      });
    }

  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch businesses',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
