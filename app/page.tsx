'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { brandColors } from '@/lib/theme';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;

      try {
        if (!user) {
          // Not logged in - redirect to login page
          console.log('No user detected, redirecting to /login');
          router.push('/login');
          return;
        }

        console.log('User detected:', user.uid);

        // Fetch user role from database
        const response = await fetch(`/api/users/${user.uid}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        const userData = await response.json();
        console.log('User data received:', userData);

        if (!userData || !userData.role) {
          throw new Error('User role not found in database');
        }

        // Route based on role
        if (userData.role === 'consumer') {
          console.log('Routing consumer to /consumer');
          router.push('/consumer');
        } else if (userData.role === 'supplier') {
          console.log('Routing supplier to /supplier/dashboard');
          router.push('/supplier/dashboard');
        } else if (userData.role === 'admin') {
          console.log('Routing admin to /admin/dashboard');
          router.push('/admin/dashboard');
        } else {
          throw new Error(`Unknown role: ${userData.role}`);
        }
      } catch (err) {
        console.error('Error during routing:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" 
           style={{ backgroundColor: brandColors.background }}>
        <div className="text-center p-8 max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4" 
              style={{ color: brandColors.text }}>
            Error Loading Page
          </h1>
          <p className="mb-6" style={{ color: brandColors.textLight }}>
            {error}
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 rounded-lg font-semibold text-white"
            style={{ backgroundColor: brandColors.primary }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" 
         style={{ backgroundColor: brandColors.background }}>
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
             style={{ borderColor: brandColors.primary, borderRightColor: 'transparent' }}
             role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
        <p className="mt-4 text-lg" style={{ color: brandColors.textLight }}>
          Loading your dashboard...
        </p>
      </div>
    </div>
  );
}
