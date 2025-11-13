// components/ConsumerNavigation.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { brandColors } from '@/lib/theme';

export default function ConsumerNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const navItems = [
  {
    name: 'Find Businesses',  // Changed from 'Map'
    href: '/consumer/map',
    icon: '🗺️'
  },
  {
    name: 'My Favorites',     // Changed from 'Favorites'
    href: '/consumer/favorites',
    icon: '❤️'
  },
  {
    name: 'Profile',
    href: '/consumer/profile',
    icon: '👤'
  }
];

  return (
    <nav className="border-b" style={{ 
      backgroundColor: 'white',
      borderColor: brandColors.background
    }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/consumer/map" className="flex items-center gap-2">
            <span className="text-2xl">🛍️</span>
            <span className="text-xl font-bold" style={{ color: brandColors.primary }}>
              Lokolo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  style={{
                    backgroundColor: isActive ? brandColors.secondary : 'transparent',
                    color: isActive ? brandColors.text : brandColors.textLight
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <button
              onClick={handleSignOut}
              className="ml-4 px-4 py-2 rounded-lg font-medium"
              style={{ 
                backgroundColor: brandColors.background,
                color: brandColors.textLight
              }}
            >
              Sign Out
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ 
                backgroundColor: brandColors.background,
                color: brandColors.textLight
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden pb-4">
          <div className="flex gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex-1 px-3 py-2 rounded-lg font-medium text-center transition-colors"
                  style={{
                    backgroundColor: isActive ? brandColors.secondary : brandColors.background,
                    color: isActive ? brandColors.text : brandColors.textLight
                  }}
                >
                  <div className="text-xl mb-1">{item.icon}</div>
                  <div className="text-xs">{item.name}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
