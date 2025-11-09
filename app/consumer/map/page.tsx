'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { brandColors } from '@/lib/theme';

interface Business {
  id: string;
  business_name: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  address_formatted: string;
  city: string;
  phone: string;
  email: string;
  whatsapp_number: string;
  verification_status: string;
  cover_photo?: string;
  distance_km?: number;
}

const categories = [
  'All Categories',
  'Restaurant',
  'Retail Shop',
  'Beauty & Hair Salon',
  'Professional Services',
  'Health & Wellness',
  'Auto Services',
  'Home Services',
  'Entertainment',
  'Education',
  'Other'
];

export default function ConsumerMapView() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [radiusKm, setRadiusKm] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  // Auth check
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

  // Get user location
  useEffect(() => {
    const savedLat = sessionStorage.getItem('userLat');
    const savedLng = sessionStorage.getItem('userLng');

    if (savedLat && savedLng) {
      setUserLocation({ lat: parseFloat(savedLat), lng: parseFloat(savedLng) });
    } else {
      // Default to Johannesburg
      setUserLocation({ lat: -26.2041, lng: 28.0473 });
    }
  }, []);

  // Fetch businesses
  useEffect(() => {
    if (!userLocation) return;

    const fetchBusinesses = async () => {
      try {
        const params = new URLSearchParams({
          latitude: userLocation.lat.toString(),
          longitude: userLocation.lng.toString(),
          radius: (radiusKm * 1000).toString(),
          ...(selectedCategory !== 'All Categories' && { category: selectedCategory })
        });

        const response = await fetch(`/api/businesses/search?${params}`);
        const data = await response.json();

        if (data.success) {
          setBusinesses(data.businesses);
          setFilteredBusinesses(data.businesses);
        }
      } catch (error) {
        console.error('Error fetching businesses:', error);
      }
    };

    fetchBusinesses();
  }, [userLocation, radiusKm, selectedCategory]);

  // Filter by search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBusinesses(businesses);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = businesses.filter(business =>
      business.business_name.toLowerCase().includes(query) ||
      business.category.toLowerCase().includes(query) ||
      business.city?.toLowerCase().includes(query)
    );
    setFilteredBusinesses(filtered);
  }, [searchQuery, businesses]);

  const requestUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(newLocation);
          sessionStorage.setItem('userLat', newLocation.lat.toString());
          sessionStorage.setItem('userLng', newLocation.lng.toString());
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #FFF7ED, #FEFCE8)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: brandColors.primary }}></div>
      </div>
    );
  }

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(to bottom right, #FFF7ED, #FEFCE8)' }}>
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2" style={{ color: brandColors.text }}>Maps Not Configured</h2>
          <p style={{ color: brandColors.textLight }}>Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold" style={{ color: brandColors.primary }}>Lokolo</h1>
            <button
              onClick={() => router.push('/consumer/profile')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': brandColors.primary } as React.CSSProperties}
            />
            <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap"
              style={{ backgroundColor: `${brandColors.primary}20`, color: brandColors.primaryDark }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Filters
            </button>
            <button
              onClick={requestUserLocation}
              className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap"
              style={{ backgroundColor: `${brandColors.accent}20`, color: brandColors.accent }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Near Me
            </button>
            <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium whitespace-nowrap">
              {filteredBusinesses.length} businesses
            </span>
          </div>

          {/* Filter Dropdown */}
          {showFilters && (
            <div className="mt-3 p-4 bg-gray-50 rounded-xl space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': brandColors.primary } as React.CSSProperties}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Radius: {radiusKm}km
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                  className="w-full"
                  style={{ accentColor: brandColors.primary }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Map View */}
      <div className="flex-1 relative">
        {userLocation && (
          <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <Map
              defaultCenter={userLocation}
              defaultZoom={13}
              mapId="lokolo-map"
              style={{ width: '100%', height: '100%' }}
              gestureHandling="greedy"
              disableDefaultUI={false}
            >
              {/* User Location Marker */}
              <AdvancedMarker position={userLocation}>
                <div className="w-4 h-4 rounded-full border-4 border-white shadow-lg" style={{ backgroundColor: brandColors.accent }}></div>
              </AdvancedMarker>

              {/* Business Markers */}
              {filteredBusinesses.map((business) => (
                <AdvancedMarker
                  key={business.id}
                  position={{ lat: business.latitude, lng: business.longitude }}
                  onClick={() => setSelectedBusiness(business)}
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center" style={{ backgroundColor: brandColors.primary }}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                </AdvancedMarker>
              ))}

              {/* Info Window */}
              {selectedBusiness && (
                <InfoWindow
                  position={{ lat: selectedBusiness.latitude, lng: selectedBusiness.longitude }}
                  onCloseClick={() => setSelectedBusiness(null)}
                >
                  <div className="p-2 max-w-xs">
                    <h3 className="font-bold text-gray-900 mb-1">{selectedBusiness.business_name}</h3>
                    <p className="text-sm font-medium mb-2" style={{ color: brandColors.primary }}>
                      {selectedBusiness.category}
                    </p>
                    <p className="text-xs text-gray-600 mb-2">{selectedBusiness.city}</p>
                    {selectedBusiness.distance_km !== undefined && (
                      <p className="text-xs font-medium mb-3" style={{ color: brandColors.accent }}>
                        {selectedBusiness.distance_km.toFixed(1)}km away
                      </p>
                    )}
                    <button
                      onClick={() => router.push(`/consumer/business/${selectedBusiness.id}`)}
                      className="w-full px-4 py-2 rounded-lg text-white text-sm font-semibold"
                      style={{ backgroundColor: brandColors.primary }}
                    >
                      View Details →
                    </button>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        )}
      </div>

      {/* Business List (Bottom Sheet) */}
      <div className="h-64 overflow-y-auto bg-white border-t border-gray-200">
        <div className="p-4 space-y-3">
          {filteredBusinesses.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-500">No businesses found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            filteredBusinesses.map((business) => (
              <div
                key={business.id}
                onClick={() => router.push(`/consumer/business/${business.id}`)}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex gap-3">
                  {/* Business Photo */}
                  <div className="w-20 h-20 rounded-lg flex-shrink-0 overflow-hidden" style={{ background: 'linear-gradient(135deg, #F97316 0%, #EAB308 100%)' }}>
                    {business.cover_photo ? (
                      <img src={business.cover_photo} alt={business.business_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Business Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{business.business_name}</h3>
                      {business.verification_status === 'verified' && (
                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: brandColors.accent }}>
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm font-medium mb-1" style={{ color: brandColors.primary }}>{business.category}</p>
                    <p className="text-xs text-gray-500 truncate">{business.city}</p>
                    {business.distance_km !== undefined && (
                      <p className="text-xs font-medium mt-1" style={{ color: brandColors.accent }}>
                        {business.distance_km.toFixed(1)}km away
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
