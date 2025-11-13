// app/consumer/business/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { brandColors } from '@/lib/theme';
import { shareBusinessLocation, shareWithDirections } from '@/lib/shareLocation';
import FavoriteButton from '@/components/FavoriteButton';

interface Business {
  id: string;
  business_name: string;
  category: string;
  description?: string;
  address?: string;
  city: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  website?: string;
  verification_status: string;
}

export default function BusinessDetailPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params.id as string;
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusiness();
  }, [businessId]);

  const fetchBusiness = async () => {
    try {
      const response = await fetch(`/api/businesses/${businessId}`);
      const data = await response.json();
      
      if (response.ok) {
        setBusiness(data);
      } else {
        console.error('Failed to fetch business');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareLocation = async () => {
    if (!business) return;

    await shareBusinessLocation({
      businessName: business.business_name,
      address: business.address || '',
      latitude: business.latitude,
      longitude: business.longitude,
      city: business.city
    });
  };

  const handleGetDirections = async () => {
    if (!business) return;

    await shareWithDirections({
      businessName: business.business_name,
      latitude: business.latitude,
      longitude: business.longitude,
      city: business.city
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: brandColors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: brandColors.primary }}></div>
          <p className="mt-4" style={{ color: brandColors.textLight }}>Loading business...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: brandColors.background }}>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4" style={{ color: brandColors.text }}>
            Business not found
          </h2>
          <button
            onClick={() => router.push('/consumer/map')}
            className="px-6 py-3 rounded-lg font-medium text-white"
            style={{ backgroundColor: brandColors.primary }}
          >
            Back to Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.background }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 font-medium"
          style={{ color: brandColors.primary }}
        >
          ← Back
        </button>

        {/* Business Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2" style={{ color: brandColors.text }}>
                {business.business_name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ 
                  backgroundColor: brandColors.secondary,
                  color: brandColors.text
                }}>
                  {business.category}
                </span>
                {business.verification_status === 'verified' && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium text-white" style={{ 
                    backgroundColor: brandColors.accent
                  }}>
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>
            <FavoriteButton businessId={business.id} size="md" />
          </div>

          {/* Description */}
          {business.description && (
            <p className="mb-6" style={{ color: brandColors.textLight }}>
              {business.description}
            </p>
          )}

          {/* Contact Information */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-xl">📍</span>
              <div>
                <p style={{ color: brandColors.text }}>
                  {business.address || business.city}
                </p>
                <p className="text-sm" style={{ color: brandColors.textLight }}>
                  {business.city}
                </p>
              </div>
            </div>

            {business.phone && (
              <div className="flex items-center gap-3">
                <span className="text-xl">📞</span>
                <a 
                  href={`tel:${business.phone}`}
                  className="hover:underline"
                  style={{ color: brandColors.primary }}
                >
                  {business.phone}
                </a>
              </div>
            )}

            {business.email && (
              <div className="flex items-center gap-3">
                <span className="text-xl">✉️</span>
                <a 
                  href={`mailto:${business.email}`}
                  className="hover:underline"
                  style={{ color: brandColors.primary }}
                >
                  {business.email}
                </a>
              </div>
            )}

            {business.website && (
              <div className="flex items-center gap-3">
                <span className="text-xl">🌐</span>
                <a 
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  style={{ color: brandColors.primary }}
                >
                  Visit Website
                </a>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleGetDirections}
              className="flex-1 min-w-[200px] px-6 py-3 rounded-lg font-medium text-white"
              style={{ backgroundColor: brandColors.primary }}
            >
              🧭 Get Directions
            </button>
            <button
              onClick={handleShareLocation}
              className="flex-1 min-w-[200px] px-6 py-3 rounded-lg font-medium"
              style={{ 
                backgroundColor: brandColors.background,
                color: brandColors.primary,
                border: `2px solid ${brandColors.primary}`
              }}
            >
              📤 Share Location
            </button>
          </div>
        </div>

        {/* Map Preview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: brandColors.text }}>
            Location
          </h2>
          <div className="aspect-video rounded-lg overflow-hidden" style={{ backgroundColor: brandColors.background }}>
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${business.latitude},${business.longitude}`}
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
}
