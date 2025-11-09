'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { brandColors, gradients } from '@/lib/theme';

const CATEGORIES = [
  'Restaurant', 'Retail Shop', 'Beauty & Hair Salon', 'Professional Services',
  'Health & Wellness', 'Auto Services', 'Home Services', 'Entertainment', 'Education', 'Other',
];

export default function RegisterBusiness() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);

  const [formData, setFormData] = useState({
    business_name: '',
    category: '',
    description: '',
    latitude: null as number | null,
    longitude: null as number | null,
    address_formatted: '',
    street_address: '',
    city: '',
    postal_code: '',
    country: 'South Africa',
    google_place_id: '',
    phone: '',
    email: '',
    website: '',
    facebook_url: '',
    instagram_url: '',
    twitter_url: '',
    linkedin_url: '',
    tiktok_url: '',
    whatsapp_number: '',
    operating_hours: '',
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setGettingLocation(false);
        setError('');
      },
      (error) => {
        setError('Unable to get location. Please enable location access and try again.');
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).slice(0, 3);
      setPhotos(filesArray);

      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreview(prev => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    setError('');

    if (currentStep === 1) {
      if (!formData.business_name || !formData.category) {
        setError('Please fill in all required fields');
        return;
      }
    }

    if (currentStep === 2) {
      if (!formData.latitude || !formData.longitude) {
        setError('⚠️ Location is required! Please click the GPS button to set your location.');
        return;
      }
    }

    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!formData.latitude || !formData.longitude) {
      setError('⚠️ Location is required! Please go back to Step 2 and set your location.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!user) throw new Error('Not authenticated');

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

      const businessData = {
        ...formData,
        user_id: userId,
      };

      const businessResponse = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessData),
      });

      if (!businessResponse.ok) {
        const errorData = await businessResponse.json();
        throw new Error(errorData.error || 'Failed to create business');
      }

      const businessResult = await businessResponse.json();
      const businessId = businessResult.business.id;

      if (photos.length > 0) {
        for (let i = 0; i < photos.length; i++) {
          const photoFormData = new FormData();
          photoFormData.append('file', photos[i]);
          photoFormData.append('business_id', businessId);
          photoFormData.append('is_primary', i === 0 ? 'true' : 'false');

          await fetch('/api/upload', {
            method: 'POST',
            body: photoFormData,
          });
        }
      }

      router.push('/dashboard');

    } catch (err: any) {
      setError(err.message || 'Failed to register business');
    } finally {
      setLoading(false);
    }
  };

  const ProgressIndicator = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step === currentStep
                  ? 'text-white'
                  : step < currentStep
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 text-gray-700'
              }`}
              style={step === currentStep ? { backgroundColor: brandColors.primary } : {}}
            >
              {step < currentStep ? '✓' : step}
            </div>
            <div className="text-xs mt-2 text-center font-medium text-gray-700">
              {step === 1 && 'Basic'}
              {step === 2 && 'Location'}
              {step === 3 && 'Contact'}
              {step === 4 && 'Social'}
              {step === 5 && 'Photos'}
            </div>
          </div>
        ))}
      </div>
      <div className="relative mt-4">
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(currentStep / 5) * 100}%`,
              backgroundColor: brandColors.primary,
            }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: gradients.background }}>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: brandColors.primary }}>
              Register Your Business
            </h1>
            <p className="text-gray-700 font-medium">
              Complete all steps to list your business
            </p>
          </div>

          <ProgressIndicator />

          {error && (
            <div className="mb-6 p-4 bg-orange-50 border-2 border-orange-300 rounded-lg text-orange-900 font-semibold">
              {error}
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 font-medium"
                  placeholder="Enter your business name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 font-medium"
                  required
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 font-medium"
                  placeholder="Tell customers about your business..."
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Location *</h2>
              
              <div className="p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                <p className="text-sm font-bold text-yellow-900 mb-2">
                  📍 Location Required!
                </p>
                <p className="text-sm text-yellow-800 font-medium">
                  Your business must have a GPS location so customers can find you on the map.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">
                  GPS Coordinates *
                </label>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  className="w-full p-4 text-white rounded-lg font-bold text-lg transition-colors shadow-md"
                  style={{ 
                    backgroundColor: gettingLocation ? '#9CA3AF' : brandColors.primary,
                  }}
                >
                  {gettingLocation ? '⏳ Getting Your Location...' : '📍 Set My Business Location'}
                </button>
                
                {formData.latitude && formData.longitude && (
                  <div className="mt-3 p-3 bg-green-50 border-2 border-green-400 rounded-lg">
                    <p className="text-sm font-bold text-green-900">
                      ✓ Location Set Successfully!
                    </p>
                    <p className="text-xs text-green-700 font-medium mt-1">
                      {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">
                  Street Address
                </label>
                <input
                  type="text"
                  name="street_address"
                  value={formData.street_address}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 font-medium"
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-800">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 font-medium"
                    placeholder="Johannesburg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-800">Postal Code</label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 font-medium"
                    placeholder="2000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">Country</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 font-medium"
                >
                  <option value="South Africa">South Africa</option>
                  <option value="Zimbabwe">Zimbabwe</option>
                  <option value="Namibia">Namibia</option>
                  <option value="Botswana">Botswana</option>
                  <option value="Zambia">Zambia</option>
                  <option value="Mozambique">Mozambique</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Contact Information</h2>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 font-medium"
                  placeholder="+27 123 456 789"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 font-medium"
                  placeholder="business@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 font-medium"
                  placeholder="https://yourbusiness.com"
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Social Media & Messaging</h2>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">WhatsApp Number</label>
                <input
                  type="tel"
                  name="whatsapp_number"
                  value={formData.whatsapp_number}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 font-medium"
                  placeholder="+27 123 456 789"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">Facebook</label>
                <input
                  type="url"
                  name="facebook_url"
                  value={formData.facebook_url}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 font-medium"
                  placeholder="https://facebook.com/yourbusiness"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">Instagram</label>
                <input
                  type="url"
                  name="instagram_url"
                  value={formData.instagram_url}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 font-medium"
                  placeholder="https://instagram.com/yourbusiness"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">Twitter/X</label>
                <input
                  type="url"
                  name="twitter_url"
                  value={formData.twitter_url}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 font-medium"
                  placeholder="https://twitter.com/yourbusiness"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">TikTok</label>
                <input
                  type="url"
                  name="tiktok_url"
                  value={formData.tiktok_url}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 font-medium"
                  placeholder="https://tiktok.com/@yourbusiness"
                />
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Business Photos & Hours</h2>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">
                  Upload Photos (Max 3)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-800"
                />
                <p className="text-xs text-gray-600 mt-2 font-medium">
                  First photo will be your cover photo
                </p>
              </div>

              {photoPreview.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {photoPreview.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold hover:bg-orange-700"
                      >
                        ×
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 bg-yellow-400 text-xs px-2 py-1 rounded font-bold text-gray-900">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">
                  Operating Hours (Optional)
                </label>
                <textarea
                  name="operating_hours"
                  value={formData.operating_hours}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 font-medium"
                  placeholder="Mon-Fri: 9AM-5PM&#10;Sat: 10AM-3PM&#10;Sun: Closed"
                />
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 border-2 rounded-lg font-semibold transition-colors"
                style={{ borderColor: brandColors.primary, color: brandColors.primary }}
              >
                ← Previous
              </button>
            )}
            
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 text-white rounded-lg font-semibold ml-auto shadow-md"
                style={{ backgroundColor: brandColors.primary }}
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 text-white rounded-lg font-semibold ml-auto shadow-md"
                style={{ 
                  backgroundColor: loading ? '#9CA3AF' : brandColors.primary 
                }}
              >
                {loading ? 'Registering...' : 'Complete Registration'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
