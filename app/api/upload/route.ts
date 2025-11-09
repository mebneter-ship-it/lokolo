import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import pool from '@/lib/db';

const storage = new Storage();
const bucketName = 'lokolo-business-photos';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const business_id = formData.get('business_id') as string;
    const is_primary = formData.get('is_primary') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!business_id) {
      return NextResponse.json({ error: 'business_id is required' }, { status: 400 });
    }

    // Validate UUID
    if (!UUID_REGEX.test(business_id)) {
      return NextResponse.json({ error: 'Invalid business_id (must be UUID)' }, { status: 400 });
    }

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileExtension = file.name.split('.').pop();
    const fileName = `business-${business_id}/${timestamp}-${randomString}.${fileExtension}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const bucket = storage.bucket(bucketName);
    const blob = bucket.file(fileName);
    
    await blob.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    await blob.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

    const result = await pool.query(
      `INSERT INTO business_photos (
        business_id,
        photo_url,
        storage_path,
        is_primary,
        created_at
      ) VALUES ($1, $2, $3, $4, NOW())
      RETURNING *`,
      [business_id, publicUrl, fileName, is_primary]
    );

    if (is_primary) {
      await pool.query(
        `UPDATE business_photos 
         SET is_primary = false 
         WHERE business_id = $1 AND id != $2`,
        [business_id, result.rows[0].id]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Photo uploaded successfully',
      photo: result.rows[0],
    }, { status: 201 });

  } catch (error: any) {
    console.error('Photo upload error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to upload photo',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const photo_id = searchParams.get('photo_id');

    if (!photo_id) {
      return NextResponse.json({ error: 'photo_id is required' }, { status: 400 });
    }

    const photoResult = await pool.query(
      'SELECT * FROM business_photos WHERE id = $1',
      [photo_id]
    );

    if (photoResult.rows.length === 0) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    const photo = photoResult.rows[0];

    const bucket = storage.bucket(bucketName);
    const blob = bucket.file(photo.storage_path);
    await blob.delete();

    await pool.query('DELETE FROM business_photos WHERE id = $1', [photo_id]);

    return NextResponse.json({
      success: true,
      message: 'Photo deleted successfully',
    });

  } catch (error: any) {
    console.error('Photo deletion error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to delete photo',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
