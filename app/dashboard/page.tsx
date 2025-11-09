'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { brandColors, gradients } from '@/lib/theme';
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: gradients.background }}>
        <p className="text-gray-800 font-semibold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: gradients.background }}>
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold" style={{ color: brandColors.primary }}>
            Lokolo Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border-2 rounded-lg font-semibold transition-colors hover:bg-orange-50"
            style={{ borderColor: brandColors.primary, color: brandColors.primary }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.displayName || user.email}! 👋
          </h2>
          <p className="text-gray-800 font-semibold">
            What would you like to do today?
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* My Businesses */}
          <Link href="/my-businesses">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-orange-500">
              <div className="text-5xl mb-4">🏪</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">My Businesses</h3>
              <p className="text-gray-700 font-medium">
                View, edit, and manage your registered businesses
              </p>
            </div>
          </Link>

          {/* Register New Business */}
          <Link href="/register-business">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-orange-500">
              <div className="text-5xl mb-4">➕</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Add Business</h3>
              <p className="text-gray-700 font-medium">
                Register a new business on the platform
              </p>
            </div>
          </Link>

          {/* Find Businesses (Coming Soon) */}
          <div className="bg-white rounded-lg shadow-lg p-8 opacity-60">
            <div className="text-5xl mb-4">🗺️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Find Businesses</h3>
            <p className="text-gray-700 font-medium">
              Discover businesses near you (Coming soon)
            </p>
          </div>

          {/* Profile Settings (Coming Soon) */}
          <div className="bg-white rounded-lg shadow-lg p-8 opacity-60">
            <div className="text-5xl mb-4">⚙️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Settings</h3>
            <p className="text-gray-700 font-medium">
              Manage your account settings (Coming soon)
            </p>
          </div>

          {/* Messages (Coming Soon) */}
          <div className="bg-white rounded-lg shadow-lg p-8 opacity-60">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Messages</h3>
            <p className="text-gray-700 font-medium">
              Connect with customers (Coming soon)
            </p>
          </div>

          {/* Analytics (Coming Soon) */}
          <div className="bg-white rounded-lg shadow-lg p-8 opacity-60">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-700 font-medium">
              View your business performance (Coming soon)
            </p>
          </div>
        </div>

        {/* Quick Stats (Placeholder) */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Stats</h3>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2" style={{ color: brandColors.primary }}>
                -
              </div>
              <p className="text-gray-700 font-semibold">Total Businesses</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2" style={{ color: brandColors.secondary }}>
                -
              </div>
              <p className="text-gray-700 font-semibold">Pending Verification</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2" style={{ color: brandColors.accent }}>
                -
              </div>
              <p className="text-gray-700 font-semibold">Profile Views</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2 text-gray-600">
                -
              </div>
              <p className="text-gray-700 font-semibold">Messages</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
