'use client';

import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { brandColors } from '@/lib/theme';

export default function SupplierNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/supplier/dashboard', icon: '📊' },
    { label: 'My Businesses', path: '/supplier/my-businesses', icon: '🏢' },
    { label: 'Add Business', path: '/register-business', icon: '➕' },
  ];

  return (
    <nav className="shadow-md" style={{ backgroundColor: 'white' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => router.push('/supplier/dashboard')}
          >
            <span className="text-2xl font-bold" style={{ color: brandColors.primary }}>
              Lokolo
            </span>
            <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full text-white"
                  style={{ backgroundColor: brandColors.accent }}>
              Supplier
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: pathname === item.path ? brandColors.primary : 'transparent',
                  color: pathname === item.path ? 'white' : brandColors.text,
                }}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
            
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: brandColors.background,
                color: brandColors.text,
                border: `2px solid ${brandColors.primary}`
              }}
            >
              🚪 Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => {
                const menu = document.getElementById('mobile-menu');
                if (menu) {
                  menu.classList.toggle('hidden');
                }
              }}
              className="p-2 rounded-lg"
              style={{ color: brandColors.primary }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div id="mobile-menu" className="hidden md:hidden pb-4">
          <div className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  router.push(item.path);
                  const menu = document.getElementById('mobile-menu');
                  if (menu) menu.classList.add('hidden');
                }}
                className="w-full text-left px-4 py-3 rounded-lg font-medium"
                style={{
                  backgroundColor: pathname === item.path ? brandColors.primary : brandColors.background,
                  color: pathname === item.path ? 'white' : brandColors.text,
                }}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
            
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 rounded-lg font-medium"
              style={{
                backgroundColor: brandColors.background,
                color: brandColors.text,
                border: `2px solid ${brandColors.primary}`
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}