import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await pool.query(
      'SELECT * FROM businesses WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      business: result.rows[0],
    });

  } catch (error: any) {
    console.error('Fetch business error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch business',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const {
      business_name,
      category,
      description,
      latitude,
      longitude,
      address_formatted,
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

    const result = await pool.query(
      `UPDATE businesses SET
        business_name = COALESCE($1, business_name),
        category = COALESCE($2, category),
        description = $3,
        latitude = $4,
        longitude = $5,
        address_formatted = $6,
        phone = $7,
        email = $8,
        website = $9,
        facebook_url = $10,
        instagram_url = $11,
        twitter_url = $12,
        linkedin_url = $13,
        tiktok_url = $14,
        whatsapp_number = $15,
        operating_hours = $16,
        updated_at = NOW()
      WHERE id = $17
      RETURNING *`,
      [
        business_name,
        category,
        description,
        latitude,
        longitude,
        address_formatted,
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
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Business updated successfully',
      business: result.rows[0],
    });

  } catch (error: any) {
    console.error('Update business error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update business',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await pool.query(
      'DELETE FROM business_photos WHERE business_id = $1',
      [id]
    );

    const result = await pool.query(
      'DELETE FROM businesses WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Business deleted successfully',
    });

  } catch (error: any) {
    console.error('Delete business error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to delete business',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
