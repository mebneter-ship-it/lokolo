'use client';

import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { brandColors } from '@/lib/theme';
import Image from 'next/image';

export default function SupplierNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/supplier/dashboard', icon: 'home' },
    { name: 'My Businesses', path: '/supplier/businesses', icon: 'building' },
    { name: 'Add Business', path: '/supplier/register-business', icon: 'plus' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/supplier/dashboard')}>
            <Image
              src="/lokolo-logo.png"
              alt="Lokolo"
              width={40}
              height={40}
              className="rounded"
            />
            <span className="text-xl font-bold" style={{ color: brandColors.primary }}>
              Lokolo
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`font-medium transition-colors ${
                  isActive(item.path)
                    ? 'font-semibold'
                    : 'hover:opacity-80'
                }`}
                style={{ color: isActive(item.path) ? brandColors.primary : brandColors.textLight }}
              >
                {item.name}
              </button>
            ))}
            
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: brandColors.primary }}
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg font-semibold text-white"
              style={{ backgroundColor: brandColors.primary }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex gap-4 pb-3 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                isActive(item.path) ? 'text-white' : ''
              }`}
              style={{
                backgroundColor: isActive(item.path) ? brandColors.primary : `${brandColors.primary}20`,
                color: isActive(item.path) ? 'white' : brandColors.primary
              }}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
