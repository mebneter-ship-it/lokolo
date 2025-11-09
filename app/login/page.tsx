'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { brandColors, gradients } from '@/lib/theme';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true); // ✅ DEFAULT = LOGIN (nicht Signup)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'consumer' | 'supplier'>('consumer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN - Let homepage handle role-based routing
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/'); // Homepage will redirect based on user role
      } else {
        // SIGNUP
        if (!fullName.trim()) {
          throw new Error('Please enter your full name');
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        await updateProfile(userCredential.user, {
          displayName: fullName,
        });

        // Sync user to database with role
        fetch('/api/auth/sync-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firebase_uid: userCredential.user.uid,
            email: userCredential.user.email,
            full_name: fullName,
            role: role,
          }),
        }).catch(err => console.error('Sync failed (non-critical):', err));

        // Route to appropriate dashboard after signup
        if (role === 'supplier') {
          router.push('/supplier/dashboard');
        } else {
          router.push('/consumer');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: gradients.background }}
    >
      <div className="max-w-md w-full">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/lokolo-logo.png"
              alt="Lokolo"
              width={120}
              height={120}
              priority
            />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: brandColors.primary }}>
            {isLogin ? 'Welcome Back' : 'Join Lokolo'}
          </h1>
          <p className="text-gray-800 font-semibold text-base">
            {isLogin ? 'Sign in to your account' : 'Create your account to get started'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-300 rounded-lg text-orange-800 text-sm font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* SIGNUP ONLY: Role Selection */}
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-900">
                    I want to:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('consumer')}
                      className={`p-4 rounded-lg border-2 transition-all font-semibold ${
                        role === 'consumer'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                      style={role === 'consumer' ? { borderColor: brandColors.primary } : {}}
                    >
                      <div className="text-3xl mb-2">🛒</div>
                      <div className="font-bold text-gray-900 text-base">Find Businesses</div>
                      <div className="text-xs text-gray-700 mt-1 font-medium">Consumer</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('supplier')}
                      className={`p-4 rounded-lg border-2 transition-all font-semibold ${
                        role === 'supplier'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                      style={role === 'supplier' ? { borderColor: brandColors.primary } : {}}
                    >
                      <div className="text-3xl mb-2">🏪</div>
                      <div className="font-bold text-gray-900 text-base">List My Business</div>
                      <div className="text-xs text-gray-700 mt-1 font-medium">Supplier</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-900">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-orange-500 focus:outline-none text-gray-900 font-medium placeholder-gray-400"
                    required
                  />
                </div>
              </>
            )}

            {/* Email (both login & signup) */}
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-900">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-orange-500 focus:outline-none text-gray-900 font-medium placeholder-gray-400"
                required
              />
            </div>

            {/* Password (both login & signup) */}
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-900">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-orange-500 focus:outline-none text-gray-900 font-medium placeholder-gray-400"
                required
                minLength={6}
              />
              {!isLogin && (
                <p className="text-xs text-gray-600 mt-1 font-medium">
                  At least 6 characters
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white rounded-lg font-bold text-lg transition-colors shadow-md"
              style={{
                backgroundColor: loading ? '#9CA3AF' : brandColors.primary,
              }}
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Toggle Login/Signup Link - BELOW the button */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-sm font-bold hover:underline"
              style={{ color: brandColors.primary }}
            >
              {isLogin 
                ? "Don't have an account? Create one" 
                : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-sm text-gray-900 font-semibold">
          Supporting Black-Owned Businesses in Southern Africa 🌍
        </p>
      </div>
    </div>
  );
}
