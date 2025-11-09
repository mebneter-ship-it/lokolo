'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { brandColors } from '@/lib/theme';
import Image from 'next/image';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Don't show nav on login page or landing page
  if (pathname === '/login' || pathname === '/') {
    return null;
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <Image src="/lokolo-logo.png" alt="Lokolo" width={40} height={40} />
            <span className="text-2xl font-bold" style={{ color: brandColors.primary }}>
              Lokolo
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link
              href="/dashboard"
              className={`font-semibold transition-colors ${
                pathname === '/dashboard'
                  ? 'font-bold'
                  : 'text-gray-700 hover:text-orange-600'
              }`}
              style={pathname === '/dashboard' ? { color: brandColors.primary } : {}}
            >
              Dashboard
            </Link>

            {user && (
              <>
                <Link
                  href="/my-businesses"
                  className={`font-semibold transition-colors ${
                    pathname === '/my-businesses' || pathname?.startsWith('/edit-business')
                      ? 'font-bold'
                      : 'text-gray-700 hover:text-orange-600'
                  }`}
                  style={pathname === '/my-businesses' || pathname?.startsWith('/edit-business') ? { color: brandColors.primary } : {}}
                >
                  My Businesses
                </Link>

                <Link
                  href="/register-business"
                  className={`font-semibold transition-colors ${
                    pathname === '/register-business'
                      ? 'font-bold'
                      : 'text-gray-700 hover:text-orange-600'
                  }`}
                  style={pathname === '/register-business' ? { color: brandColors.primary } : {}}
                >
                  + Add Business
                </Link>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg font-semibold text-white transition-colors hover:opacity-90"
                  style={{ backgroundColor: brandColors.primary }}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
