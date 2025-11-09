'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ConsumerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    // Check location permission status
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state as 'granted' | 'denied' | 'prompt');
      });
    }
  }, []);

  const requestLocation = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      // Store location in sessionStorage
      sessionStorage.setItem('userLat', position.coords.latitude.toString());
      sessionStorage.setItem('userLng', position.coords.longitude.toString());
      
      // Navigate to map with location
      router.push('/consumer/map');
    } catch (error) {
      console.error('Location error:', error);
      // Still allow access to map without location
      router.push('/consumer/map');
    }
  };

  const browseWithoutLocation = () => {
    router.push('/consumer/map');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-teal-50">
      {/* Header */}
      <header className="bg-white border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-orange-600">Lokolo</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-100 rounded-full mb-6">
            <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Discover Black-Owned Businesses Near You
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Connect with local businesses in your community. Enable location to find the closest matches.
          </p>
        </div>

        {/* Location Permission Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          {locationPermission === 'granted' ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Location Enabled</h3>
              <p className="text-gray-600 mb-6">We'll show you businesses nearest to you</p>
              <button
                onClick={requestLocation}
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Continue to Map
              </button>
            </div>
          ) : locationPermission === 'denied' ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Location Blocked</h3>
              <p className="text-gray-600 mb-4">
                You can still browse businesses, but we won't be able to show you the closest ones.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                To enable location: Settings → Privacy → Location Services
              </p>
              <button
                onClick={browseWithoutLocation}
                className="w-full sm:w-auto bg-gray-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Browse Without Location
              </button>
            </div>
          ) : (
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Enable Your Location</h3>
              <p className="text-gray-600 mb-6">
                Get personalized recommendations based on businesses near you
              </p>
              <button
                onClick={requestLocation}
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 shadow-md hover:shadow-lg mb-3"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Enable Location
                </span>
              </button>
              <button
                onClick={browseWithoutLocation}
                className="w-full sm:w-auto text-gray-600 px-8 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
              >
                Skip for now
              </button>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-3">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Search</h4>
            <p className="text-sm text-gray-600">Find businesses by name or category</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-3">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Explore</h4>
            <p className="text-sm text-gray-600">Browse on an interactive map</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-100 rounded-full mb-3">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Connect</h4>
            <p className="text-sm text-gray-600">Contact businesses directly</p>
          </div>
        </div>
      </main>
    </div>
  );
}
