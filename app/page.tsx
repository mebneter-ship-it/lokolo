'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // FIXED: Changed backtick to parenthesis
        const response = await fetch(`/api/users/${user.uid}`);
        const data = await response.json();

        if (data.success && data.user && data.user.role) {
          if (data.user.role === 'consumer') {
            router.push('/consumer');
          } else if (data.user.role === 'supplier') {
            router.push('/supplier/dashboard');
          } else if (data.user.role === 'admin') {
            router.push('/admin');
          } else {
            console.error('Unknown user role:', data.user.role);
            router.push('/login');
          }
        } else {
          console.error('User not found in database or no role assigned');
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-teal-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
