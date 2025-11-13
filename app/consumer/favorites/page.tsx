// app/consumer/favorites/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { brandColors } from '@/lib/theme';

interface FavoriteBusiness {
  id: string;
  business_name: string;
  slug: string;
  category: string;
  city: string;
  latitude: number;
  longitude: number;
  verification_status: string;
  favorited_at: string;
}

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchFavorites(user.uid);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchFavorites = async (uid: string) => {
    try {
      const response = await fetch(`/api/consumer/favorites?user_id=${uid}`);
      const data = await response.json();
      
      if (response.ok) {
        setFavorites(data.favorites || []);
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (businessId: string) => {
    if (!userId) return;

    try {
      const response = await fetch(
        `/api/consumer/favorites?user_id=${userId}&business_id=${businessId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        setFavorites(favorites.filter(fav => fav.id !== businessId));
      }
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  const viewOnMap = (lat: number, lng: number) => {
    router.push(`/consumer/map?lat=${lat}&lng=${lng}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: brandColors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: brandColors.primary }}></div>
          <p className="mt-4" style={{ color: brandColors.textLight }}>Loading favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.background }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: brandColors.text }}>
            My Favorites
          </h1>
          <p style={{ color: brandColors.textLight }}>
            {favorites.length} {favorites.length === 1 ? 'business' : 'businesses'} saved
          </p>
        </div>

        {/* Favorites List */}
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4 text-6xl">❤️</div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: brandColors.text }}>
              No favorites yet
            </h2>
            <p className="mb-6" style={{ color: brandColors.textLight }}>
              Start exploring and save your favorite businesses
            </p>
            <button
              onClick={() => router.push('/consumer/map')}
              className="px-6 py-3 rounded-lg font-medium text-white"
              style={{ backgroundColor: brandColors.primary }}
            >
              Explore Businesses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((business) => (
              <div
                key={business.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Business Image Placeholder */}
                <div className="h-48 flex items-center justify-center" style={{ backgroundColor: brandColors.secondary }}>
                  <span className="text-6xl">🏪</span>
                </div>

                {/* Business Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold flex-1" style={{ color: brandColors.text }}>
                      {business.business_name}
                    </h3>
                    {business.verification_status === 'verified' && (
                      <span className="text-xs px-2 py-1 rounded" style={{ 
                        backgroundColor: brandColors.accent,
                        color: 'white'
                      }}>
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  <p className="text-sm mb-1" style={{ color: brandColors.textLight }}>
                    {business.category}
                  </p>
                  <p className="text-sm mb-4" style={{ color: brandColors.textLight }}>
                    📍 {business.city}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/consumer/business/${business.id}`)}
                      className="flex-1 px-4 py-2 rounded-lg font-medium text-white"
                      style={{ backgroundColor: brandColors.primary }}
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => viewOnMap(business.latitude, business.longitude)}
                      className="px-4 py-2 rounded-lg font-medium"
                      style={{ 
                        backgroundColor: brandColors.background,
                        color: brandColors.primary,
                        border: `2px solid ${brandColors.primary}`
                      }}
                      title="View on Map"
                    >
                      🗺️
                    </button>
                    <button
                      onClick={() => removeFavorite(business.id)}
                      className="px-4 py-2 rounded-lg font-medium"
                      style={{ 
                        backgroundColor: brandColors.background,
                        color: '#EF4444',
                        border: '2px solid #EF4444'
                      }}
                      title="Remove from Favorites"
                    >
                      ❤️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
