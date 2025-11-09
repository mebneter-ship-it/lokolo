'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { brandColors } from '@/lib/theme';

interface FavoriteButtonProps {
  businessId: string;
  initialFavorited?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function FavoriteButton({ 
  businessId, 
  initialFavorited = false,
  size = 'md',
  showLabel = false 
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Get user ID from database
        const response = await fetch(`/api/users/${user.uid}`);
        const data = await response.json();
        if (data.success) {
          setUserId(data.user.id);
          checkFavoriteStatus(data.user.id);
        }
      }
    });

    return () => unsubscribe();
  }, [businessId]);

  const checkFavoriteStatus = async (uid: string) => {
    try {
      const response = await fetch(`/api/favorites?user_id=${uid}`);
      const data = await response.json();
      if (data.success) {
        const favorited = data.favorites.some((fav: any) => fav.id === businessId);
        setIsFavorited(favorited);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click events
    
    if (!userId) return;
    
    setLoading(true);
    
    try {
      if (isFavorited) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?user_id=${userId}&business_id=${businessId}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        
        if (data.success) {
          setIsFavorited(false);
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, business_id: businessId })
        });
        const data = await response.json();
        
        if (data.success) {
          setIsFavorited(true);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all ${
        loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
      } ${showLabel ? 'gap-2 px-4' : ''}`}
      style={{
        backgroundColor: isFavorited ? brandColors.accent : 'white',
        border: `2px solid ${isFavorited ? brandColors.accent : brandColors.primary}`,
      }}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className={iconSizes[size]}
        fill={isFavorited ? 'white' : 'none'}
        stroke={isFavorited ? 'white' : brandColors.primary}
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {showLabel && (
        <span className="text-sm font-medium" style={{ color: isFavorited ? 'white' : brandColors.primary }}>
          {isFavorited ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
}
