'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { brandColors, gradients } from '@/lib/theme';
import Link from 'next/link';

interface Business {
  id: string;
  business_name: string;
  category: string;
  description: string;
  address_formatted: string;
  street_address: string;
  city: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
  verification_status: string;
  created_at: string;
}

export default function MyBusinesses() {
  const { user } = useAuth();
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchBusinesses();
  }, [user, router]);

  const fetchBusinesses = async () => {
    try {
      if (!user) return;

      const userResponse = await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebase_uid: user.uid,
          email: user.email,
          full_name: user.displayName || '',
          role: 'supplier',
        }),
      });

      const userData = await userResponse.json();
      const userId = userData.user.id;

      const response = await fetch(`/api/businesses?user_id=${userId}`);
      const data = await response.json();

      if (data.success) {
        setBusinesses(data.businesses);
      }
    } catch (err: any) {
      setError('Failed to load businesses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (businessId: string, businessName: string) => {
    if (!confirm(`Are you sure you want to delete "${businessName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/businesses/${businessId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBusinesses(businesses.filter(b => b.id !== businessId));
        alert('Business deleted successfully');
      } else {
        alert('Failed to delete business');
      }
    } catch (err) {
      alert('Error deleting business');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: gradients.background }}>
        <p className="text-gray-800 font-semibold text-lg">Loading your businesses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: gradients.background }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: brandColors.primary }}>
              My Businesses
            </h1>
            <p className="text-gray-800 font-semibold text-lg">
              Manage your registered businesses
            </p>
          </div>
          <Link
            href="/register-business"
            className="px-6 py-3 text-white rounded-lg font-bold shadow-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: brandColors.primary }}
          >
            + Add New Business
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg text-orange-800 font-semibold">
            {error}
          </div>
        )}

        {businesses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🏪</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Businesses Yet</h2>
            <p className="text-gray-800 mb-6 font-semibold">
              You haven't registered any businesses. Get started by adding your first business!
            </p>
            <Link
              href="/register-business"
              className="inline-block px-8 py-3 text-white rounded-lg font-bold shadow-md hover:opacity-90"
              style={{ backgroundColor: brandColors.primary }}
            >
              Register Your Business
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => (
              <div key={business.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border-2 border-transparent hover:border-orange-200">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex-1 pr-2">{business.business_name}</h3>
                    {business.verification_status === 'verified' ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full flex items-center gap-1 whitespace-nowrap">
                        <span>✓</span> Verified
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full flex items-center gap-1 whitespace-nowrap">
                        <span>⏳</span> Pending
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-bold mb-3" style={{ color: brandColors.primary }}>
                    {business.category}
                  </p>
                  
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2 font-medium">
                    {business.description || 'No description'}
                  </p>

                  {(business.street_address || business.city) && (
                    <div className="mb-2 flex items-start gap-2">
                      <span className="text-gray-600 text-sm">📍</span>
                      <p className="text-sm text-gray-700 font-medium flex-1">
                        {[business.street_address, business.city, business.postal_code, business.country]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  )}

                  {business.phone && (
                    <div className="mb-4 flex items-center gap-2">
                      <span className="text-gray-600 text-sm">📞</span>
                      <p className="text-sm text-gray-700 font-medium">{business.phone}</p>
                    </div>
                  )}

                  <div className="flex gap-2 mt-6 pt-4 border-t border-gray-100">
                    <Link
                      href={`/edit-business/${business.id}`}
                      className="flex-1 px-4 py-2 border-2 rounded-lg font-bold text-center transition-colors hover:bg-orange-50"
                      style={{ 
                        borderColor: brandColors.primary, 
                        color: brandColors.primary 
                      }}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(business.id, business.business_name)}
                      className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-colors"
                    >
                      Delete
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
