'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { brandColors } from '@/lib/theme';
import FavoriteButton from '@/components/FavoriteButton';

interface Business {
  id: string;
  business_name: string;
  category: string;
  description: string;
  city: string;
  cover_photo?: string;
  verification_status: string;
  favorited_at: string;
}

export default function MyFavoritesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Business[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // Get user ID from database
        const userResponse = await fetch(`/api/users/${user.uid}`);
        const userData = await userResponse.json();
        
        if (userData.success) {
          setUserId(userData.user.id);
          fetchFavorites(userData.user.id);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchFavorites = async (uid: string) => {
    try {
      const response = await fetch(`/api/favorites?user_id=${uid}`);
      const data = await response.json();

      if (data.success) {
        setFavorites(data.favorites);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (userId) {
      setLoading(true);
      fetchFavorites(userId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #FFF7ED, #FEFCE8)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: brandColors.primary }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #FFF7ED, #FEFCE8)' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold" style={{ color: brandColors.primary }}>
            My Favorites
          </h1>
          <p className="text-gray-600 mt-2">
            {favorites.length} saved {favorites.length === 1 ? 'business' : 'businesses'}
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6" style={{ backgroundColor: `${brandColors.primary}20` }}>
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: brandColors.primary }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Favorites Yet</h2>
            <p className="text-gray-600 mb-6">
              Start exploring and save your favorite businesses to see them here
            </p>
            <button
              onClick={() => router.push('/consumer/map')}
              className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: brandColors.primary }}
            >
              Find Businesses
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((business) => (
              <div
                key={business.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all hover:shadow-xl"
                onClick={() => router.push(`/consumer/business/${business.id}`)}
              >
                {/* Business Photo */}
                <div className="relative h-48 overflow-hidden" style={{ background: 'linear-gradient(135deg, #F97316 0%, #EAB308 100%)' }}>
                  {business.cover_photo ? (
                    <img src={business.cover_photo} alt={business.business_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Favorite Button */}
                  <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
                    <FavoriteButton 
                      businessId={business.id} 
                      initialFavorited={true}
                      size="md"
                    />
                  </div>

                  {/* Verified Badge */}
                  {business.verification_status === 'verified' && (
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full flex items-center gap-1" style={{ backgroundColor: brandColors.accent }}>
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-medium text-white">Verified</span>
                    </div>
                  )}
                </div>

                {/* Business Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{business.business_name}</h3>
                  <p className="text-sm font-medium mb-2" style={{ color: brandColors.primary }}>
                    {business.category}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">{business.city}</p>
                  <p className="text-xs text-gray-500">
                    Saved {new Date(business.favorited_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
