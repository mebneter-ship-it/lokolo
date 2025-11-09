'use client';

import { useEffect, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { useRouter } from 'next/navigation';
import { brandColors } from '@/lib/theme';

interface Business {
  id: string;
  business_name: string;
  category: string;
  latitude: number;
  longitude: number;
  address_formatted: string;
  city: string;
  verification_status: string;
}

export default function ConsumerMapPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Get user's location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Johannesburg, South Africa
          setUserLocation({ lat: -26.2041, lng: 28.0473 });
        }
      );
    } else {
      // Default to Johannesburg, South Africa
      setUserLocation({ lat: -26.2041, lng: 28.0473 });
    }
  }, []);

  // Fetch businesses near user's location
  useEffect(() => {
    async function fetchBusinesses() {
      if (!userLocation) {
        console.log('Waiting for user location before fetching businesses');
        return;
      }

      try {
        console.log('Fetching businesses near:', userLocation);
        
        // Try POST request with body
        const response = await fetch('/api/businesses/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            latitude: userLocation.lat,
            longitude: userLocation.lng,
            radius: 50 // 50km radius
          })
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', errorText);
          console.warn('Unable to fetch businesses, showing map without markers');
          setBusinesses([]);
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        console.log('Businesses fetched:', data.businesses?.length || 0);
        setBusinesses(data.businesses || []);
      } catch (err) {
        console.error('Error fetching businesses:', err);
        console.warn('Continuing with empty business list');
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBusinesses();
  }, [userLocation]); // Re-fetch when user location changes

  // Check if API key is available
  if (!apiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center" 
           style={{ backgroundColor: brandColors.background }}>
        <div className="text-center p-8 max-w-md">
          <div className="text-6xl mb-4">🗺️</div>
          <h1 className="text-2xl font-bold mb-4" 
              style={{ color: brandColors.text }}>
            Maps Configuration Error
          </h1>
          <p className="mb-6" style={{ color: brandColors.textLight }}>
            Google Maps API key is not configured. Please contact support.
          </p>
          <div className="text-sm p-4 rounded-lg" 
               style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
            <strong>For developers:</strong> Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.
          </div>
        </div>
      </div>
    );
  }

  if (loading || !userLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center" 
           style={{ backgroundColor: brandColors.background }}>
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"
               style={{ borderColor: brandColors.primary, borderRightColor: 'transparent' }}
               role="status">
          </div>
          <p className="mt-4 text-lg" style={{ color: brandColors.textLight }}>
            Loading map...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={userLocation}
          defaultZoom={12}
          mapId="lokolo-map"
          style={{ width: '100%', height: '100%' }}
        >
          {/* User location marker */}
          <AdvancedMarker position={userLocation}>
            <Pin
              background={brandColors.accent}
              borderColor={brandColors.text}
              glyphColor={brandColors.background}
            />
          </AdvancedMarker>

          {/* Business markers */}
          {businesses.map((business) => (
            <AdvancedMarker
              key={business.id}
              position={{ lat: business.latitude, lng: business.longitude }}
              onClick={() => router.push(`/consumer/business/${business.id}`)}
            >
              <Pin
                background={brandColors.primary}
                borderColor={brandColors.primaryDark}
                glyphColor="#FFFFFF"
              />
            </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>

      {/* Floating info card */}
      <div className="absolute top-4 left-4 right-4 md:left-4 md:right-auto md:w-80 bg-white rounded-lg shadow-lg p-4">
        <h2 className="text-xl font-bold mb-2" style={{ color: brandColors.text }}>
          Discover Black-Owned Businesses
        </h2>
        <p className="text-sm mb-3" style={{ color: brandColors.textLight }}>
          {businesses.length} businesses near you
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/consumer/favorites')}
            className="flex-1 px-4 py-2 rounded-lg font-semibold text-white"
            style={{ backgroundColor: brandColors.accent }}
          >
            My Favorites
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg font-semibold"
            style={{ 
              backgroundColor: brandColors.background,
              color: brandColors.text,
              border: `2px solid ${brandColors.primary}`
            }}
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
