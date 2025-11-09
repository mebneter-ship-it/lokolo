import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// Helper function to generate slug
function generateSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-')  // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      user_id,
      business_name,
      category,
      description,
      latitude,
      longitude,
      address_formatted,
      street_address,
      city,
      postal_code,
      country,
      google_place_id,
      phone,
      email,
      website,
      facebook_url,
      instagram_url,
      twitter_url,
      linkedin_url,
      tiktok_url,
      whatsapp_number,
      operating_hours,
    } = body;

    if (!user_id || !business_name || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, business_name, category' },
        { status: 400 }
      );
    }

    // Generate slug from business name
    const slug = generateSlug(business_name);

    const insert = `
      INSERT INTO businesses (
        user_id, business_name, slug, category, description,
        address_formatted, street_address, city, postal_code, country,
        latitude, longitude, phone, email, website, whatsapp_number,
        facebook_url, instagram_url, twitter_url, linkedin_url, tiktok_url,
        operating_hours, google_place_id
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23
      )
      RETURNING *;
    `;

    const params = [
      user_id,
      business_name,
      slug,  // Added slug!
      category,
      description ?? null,
      address_formatted ?? null,
      street_address ?? null,
      city ?? null,
      postal_code ?? null,
      country ?? null,
      latitude ?? null,
      longitude ?? null,
      phone ?? null,
      email ?? null,
      website ?? null,
      whatsapp_number ?? null,
      facebook_url ?? null,
      instagram_url ?? null,
      twitter_url ?? null,
      linkedin_url ?? null,
      tiktok_url ?? null,
      operating_hours ?? null,
      google_place_id ?? null
    ];

    const { rows } = await pool.query(insert, params);
    return NextResponse.json({ success: true, business: rows[0] }, { status: 201 });

  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to register business',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    const query = `
      SELECT * FROM businesses
      WHERE user_id = $1
      ORDER BY created_at DESC NULLS LAST, business_name ASC
    `;
    
    const { rows } = await pool.query(query, [user_id]);
    return NextResponse.json({ success: true, businesses: rows });

  } catch (error: any) {
    console.error('Fetch businesses error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch businesses',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
