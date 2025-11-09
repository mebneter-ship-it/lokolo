'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface UserProfile {
  id: string;
  firebase_uid: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export default function ConsumerProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI state
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login');
        return;
      }

      try {
        // Fetch user profile from database
        const response = await fetch(`/api/users/${firebaseUser.uid}`);
        const data = await response.json();

        if (data.success) {
          setUser(data.user);
          setFullName(data.user.full_name || '');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setErrorMessage('Failed to load profile');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setErrorMessage('');
    setSuccessMessage('');
    setSaving(true);

    try {
      // Update user profile in database
      const response = await fetch(`/api/users/${user.firebase_uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters');
      return;
    }

    setSaving(true);

    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser || !firebaseUser.email) {
        setErrorMessage('User not found');
        return;
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        firebaseUser.email,
        currentPassword
      );

      await reauthenticateWithCredential(firebaseUser, credential);

      // Update password
      await updatePassword(firebaseUser, newPassword);

      setSuccessMessage('Password changed successfully!');
      setShowPasswordSection(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password') {
        setErrorMessage('Current password is incorrect');
      } else if (error.code === 'auth/too-many-requests') {
        setErrorMessage('Too many attempts. Please try again later');
      } else {
        setErrorMessage('Failed to change password');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Profile not found</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 text-orange-600 font-medium"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-teal-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">My Profile</h1>
        </div>
      </header>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mx-4 mt-4 p-4 bg-teal-50 border border-teal-200 rounded-xl">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-teal-700 font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 font-medium">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Profile Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Profile Picture Section */}
        <div className="bg-white rounded-2xl p-6 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full mb-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.full_name || 'Consumer'}</h2>
          <p className="text-gray-600">{user.email}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
            Consumer Account
          </span>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-orange-600 font-medium text-sm hover:text-orange-700"
              >
                Edit
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-xl">{user.full_name || 'Not set'}</p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-xl">{user.email}</p>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Member Since */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
              <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-xl">
                {new Date(user.created_at).toLocaleDateString('en-ZA', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Save/Cancel Buttons */}
          {isEditing && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFullName(user.full_name || '');
                  setErrorMessage('');
                }}
                disabled={saving}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Change Password Section */}
        <div className="bg-white rounded-2xl p-6">
          <button
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="w-full flex items-center justify-between"
          >
            <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${showPasswordSection ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showPasswordSection && (
            <div className="mt-4 space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter current password"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>

              {/* Change Password Button */}
              <button
                onClick={handleChangePassword}
                disabled={saving}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all disabled:opacity-50"
              >
                {saving ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          
          <button
            onClick={() => router.push('/consumer/map')}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">Browse Businesses</p>
              <p className="text-sm text-gray-500">Discover local businesses on the map</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/consumer')}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">Dashboard</p>
              <p className="text-sm text-gray-500">Go to consumer dashboard</p>
            </div>
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-white border-2 border-red-200 text-red-600 px-6 py-4 rounded-2xl font-semibold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </main>

      {/* Bottom spacing */}
      <div className="h-8"></div>
    </div>
  );
}
