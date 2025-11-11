'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { brandColors } from '@/lib/theme';

interface Business {
  id: string;
  business_name: string;
  category: string;
  verification_status: string;
  is_active: boolean;
  created_at: string;
}

export default function SupplierDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    active: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchBusinesses(currentUser.uid);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchBusinesses = async (uid: string) => {
    try {
      const response = await fetch(`/api/businesses?user_uid=${uid}`);
      if (response.ok) {
        const data = await response.json();
        const businessList = data.businesses || [];
        setBusinesses(businessList);
        
        // Calculate stats
        setStats({
          total: businessList.length,
          verified: businessList.filter((b: Business) => b.verification_status === 'verified').length,
          pending: businessList.filter((b: Business) => b.verification_status === 'pending').length,
          active: businessList.filter((b: Business) => b.is_active).length
        });
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" 
           style={{ backgroundColor: brandColors.background }}>
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"
               style={{ borderColor: brandColors.primary, borderRightColor: 'transparent' }}>
          </div>
          <p className="mt-4 text-lg" style={{ color: brandColors.textLight }}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.background }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: brandColors.text }}>
            Welcome back! 👋
          </h1>
          <p style={{ color: brandColors.textLight }}>
            {user?.email}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: brandColors.textLight }}>
                  Total Businesses
                </p>
                <p className="text-3xl font-bold mt-2" style={{ color: brandColors.primary }}>
                  {stats.total}
                </p>
              </div>
              <div className="text-4xl">🏢</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: brandColors.textLight }}>
                  Verified
                </p>
                <p className="text-3xl font-bold mt-2" style={{ color: brandColors.accent }}>
                  {stats.verified}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: brandColors.textLight }}>
                  Pending Review
                </p>
                <p className="text-3xl font-bold mt-2" style={{ color: brandColors.secondary }}>
                  {stats.pending}
                </p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: brandColors.textLight }}>
                  Active
                </p>
                <p className="text-3xl font-bold mt-2" style={{ color: brandColors.primary }}>
                  {stats.active}
                </p>
              </div>
              <div className="text-4xl">🟢</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4" style={{ color: brandColors.text }}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/register-business')}
              className="p-4 rounded-lg text-left transition-all hover:shadow-lg"
              style={{ backgroundColor: brandColors.primary, color: 'white' }}
            >
              <div className="text-3xl mb-2">➕</div>
              <h3 className="font-bold mb-1">Add New Business</h3>
              <p className="text-sm opacity-90">Register a new business listing</p>
            </button>

            <button
              onClick={() => router.push('/my-businesses')}
              className="p-4 rounded-lg text-left transition-all hover:shadow-lg"
              style={{ backgroundColor: brandColors.accent, color: 'white' }}
            >
              <div className="text-3xl mb-2">🏢</div>
              <h3 className="font-bold mb-1">Manage Businesses</h3>
              <p className="text-sm opacity-90">View and edit your listings</p>
            </button>

            <button
              onClick={() => router.push('/supplier/analytics')}
              className="p-4 rounded-lg text-left transition-all hover:shadow-lg"
              style={{ backgroundColor: brandColors.secondary, color: 'white' }}
            >
              <div className="text-3xl mb-2">📈</div>
              <h3 className="font-bold mb-1">View Analytics</h3>
              <p className="text-sm opacity-90">Track your performance</p>
            </button>
          </div>
        </div>

        {/* Recent Businesses */}
        {businesses.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: brandColors.text }}>
              Your Businesses
            </h2>
            <div className="space-y-3">
              {businesses.slice(0, 5).map((business) => (
                <div
                  key={business.id}
                  className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                  onClick={() => router.push(`/my-businesses`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">🏢</div>
                    <div>
                      <h3 className="font-semibold" style={{ color: brandColors.text }}>
                        {business.business_name}
                      </h3>
                      <p className="text-sm" style={{ color: brandColors.textLight }}>
                        {business.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor:
                          business.verification_status === 'verified'
                            ? '#D1FAE5'
                            : business.verification_status === 'pending'
                            ? '#FEF3C7'
                            : '#FEE2E2',
                        color:
                          business.verification_status === 'verified'
                            ? '#065F46'
                            : business.verification_status === 'pending'
                            ? '#92400E'
                            : '#991B1B',
                      }}
                    >
                      {business.verification_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {businesses.length > 5 && (
              <button
                onClick={() => router.push('/my-businesses')}
                className="mt-4 w-full py-2 rounded-lg font-semibold"
                style={{
                  backgroundColor: brandColors.background,
                  color: brandColors.primary,
                  border: `2px solid ${brandColors.primary}`
                }}
              >
                View All Businesses
              </button>
            )}
          </div>
        )}

        {/* Empty State */}
        {businesses.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: brandColors.text }}>
              No Businesses Yet
            </h3>
            <p className="mb-6" style={{ color: brandColors.textLight }}>
              Get started by adding your first business listing
            </p>
            <button
              onClick={() => router.push('/register-business')}
              className="px-8 py-3 rounded-lg font-semibold text-white"
              style={{ backgroundColor: brandColors.primary }}
            >
              Add Your First Business
            </button>
          </div>
        )}
      </div>
    </div>
  );
}