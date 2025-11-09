'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { brandColors, gradients } from '@/lib/theme';

const CATEGORIES = [
  'Restaurant', 'Retail Shop', 'Beauty & Hair Salon', 'Professional Services',
  'Health & Wellness', 'Auto Services', 'Home Services', 'Entertainment', 'Education', 'Other',
];

const MAX_PHOTOS = 3;

interface Photo {
  id: string;
  photo_url: string;
  is_primary: boolean;
}

export default function EditBusiness() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    business_name: '',
    category: '',
    description: '',
    latitude: null as number | null,
    longitude: null as number | null,
    street_address: '',
    city: '',
    postal_code: '',
    country: 'South Africa',
    phone: '',
    email: '',
    website: '',
    facebook_url: '',
    instagram_url: '',
    whatsapp_number: '',
    operating_hours: '',
  });

  const [existingPhotos, setExistingPhotos] = useState<Photo[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (id) {
      loadBusiness();
      loadPhotos();
    }
  }, [user, router, id]);

  const loadBusiness = async () => {
    try {
      const response = await fetch(`/api/businesses/${id}`);
      const data = await response.json();

      if (data.success) {
        const b = data.business;
        setFormData({
          business_name: b.business_name || '',
          category: b.category || '',
          description: b.description || '',
          latitude: b.latitude ? parseFloat(b.latitude) : null,
          longitude: b.longitude ? parseFloat(b.longitude) : null,
          street_address: b.street_address || '',
          city: b.city || '',
          postal_code: b.postal_code || '',
          country: b.country || 'South Africa',
          phone: b.phone || '',
          email: b.email || '',
          website: b.website || '',
          facebook_url: b.facebook_url || '',
          instagram_url: b.instagram_url || '',
          whatsapp_number: b.whatsapp_number || '',
          operating_hours: b.operating_hours || '',
        });
      }
    } catch (err: any) {
      setError('Failed to load business');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPhotos = async () => {
    try {
      const response = await fetch(`/api/businesses/${id}/photos`);
      const data = await response.json();
      if (data.success) {
        setExistingPhotos(data.photos);
      }
    } catch (err) {
      console.error('Failed to load photos:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    setError('');
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
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
      },
      () => {
        setError('Unable to get location');
        setGettingLocation(false);
      }
    );
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const totalPhotos = existingPhotos.length + newPhotos.length;
    if (totalPhotos >= MAX_PHOTOS) {
      setError(`Maximum ${MAX_PHOTOS} photos allowed`);
      return;
    }

    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const remainingSlots = MAX_PHOTOS - totalPhotos;
      const filesToAdd = filesArray.slice(0, remainingSlots);

      setNewPhotos(prev => [...prev, ...filesToAdd]);

      filesToAdd.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });

      if (filesArray.length > remainingSlots) {
        setError(`Only ${remainingSlots} more photo(s) allowed`);
      }
    }
  };

  const removeExistingPhoto = async (photoId: string) => {
    if (!confirm('Delete this photo?')) return;

    try {
      const response = await fetch(`/api/upload?photo_id=${photoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setExistingPhotos(prev => prev.filter(p => p.id !== photoId));
      } else {
        alert('Failed to delete photo');
      }
    } catch (err) {
      alert('Error deleting photo');
      console.error(err);
    }
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreview(prev => prev.filter((_, i) => i !== index));
    setError('');
  };

  const nextStep = () => {
    if (currentStep === 1 && (!formData.business_name || !formData.category)) {
      setError('Please fill in required fields');
      return;
    }
    setError('');
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');

    try {
      // Update business info
      const response = await fetch(`/api/businesses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update');
      }

      // Upload new photos
      if (newPhotos.length > 0) {
        setUploadingPhotos(true);
        
        const isPrimary = existingPhotos.length === 0;
        
        for (let i = 0; i < newPhotos.length; i++) {
          const photoFormData = new FormData();
          photoFormData.append('file', newPhotos[i]);
          photoFormData.append('business_id', id);
          photoFormData.append('is_primary', (i === 0 && isPrimary) ? 'true' : 'false');

          await fetch('/api/upload', {
            method: 'POST',
            body: photoFormData,
          });
        }
        
        setUploadingPhotos(false);
      }

      setSuccess(true);
      setTimeout(() => router.push('/my-businesses'), 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to update business');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: gradients.background }}>
        <p className="text-gray-700 font-medium">Loading...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: gradients.background }}>
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: brandColors.primary }}>Updated!</h2>
          <p className="text-gray-700 font-medium">Redirecting...</p>
        </div>
      </div>
    );
  }

  const totalPhotos = existingPhotos.length + newPhotos.length;

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: gradients.background }}>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: brandColors.primary }}>Edit Business</h1>
          <p className="text-gray-700 font-medium mb-6">Update your information</p>

          {error && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg text-orange-800 font-medium">
              {error}
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">Business Name *</label>
                <input type="text" name="business_name" value={formData.business_name} onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 font-medium" required />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">Category *</label>
                <select name="category" value={formData.category} onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 font-medium" required>
                  <option value="">Select category</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 font-medium" />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Location</h2>
              <button type="button" onClick={getCurrentLocation} disabled={gettingLocation}
                className="w-full p-3 text-white rounded-lg font-semibold"
                style={{ backgroundColor: gettingLocation ? '#9CA3AF' : brandColors.primary }}>
                {gettingLocation ? 'Getting...' : '📍 Update Location'}
              </button>
              {formData.latitude && formData.longitude && (
                <p className="text-sm text-green-600 font-medium">
                  ✓ {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </p>
              )}
              <input type="text" name="street_address" placeholder="Street" value={formData.street_address} onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 font-medium" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 font-medium" />
                <input type="text" name="postal_code" placeholder="Postal" value={formData.postal_code} onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 font-medium" />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Contact</h2>
              <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 font-medium" />
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 font-medium" />
              <input type="url" name="website" placeholder="Website" value={formData.website} onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 font-medium" />
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Social Media</h2>
              <input type="tel" name="whatsapp_number" placeholder="WhatsApp" value={formData.whatsapp_number} onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 font-medium" />
              <input type="url" name="facebook_url" placeholder="Facebook" value={formData.facebook_url} onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 font-medium" />
              <input type="url" name="instagram_url" placeholder="Instagram" value={formData.instagram_url} onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 font-medium" />
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Photos & Hours</h2>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">
                  Business Photos ({totalPhotos}/{MAX_PHOTOS})
                </label>
                
                {existingPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {existingPhotos.map((photo) => (
                      <div key={photo.id} className="relative">
                        <img src={photo.photo_url} alt="Business" className="w-full h-32 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeExistingPhoto(photo.id)}
                          className="absolute top-2 right-2 bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold hover:bg-orange-700"
                        >
                          ×
                        </button>
                        {photo.is_primary && (
                          <span className="absolute bottom-2 left-2 bg-yellow-400 text-xs px-2 py-1 rounded font-bold text-gray-900">
                            Cover
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {photoPreview.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {photoPreview.map((preview, index) => (
                      <div key={index} className="relative">
                        <img src={preview} alt="New" className="w-full h-32 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeNewPhoto(index)}
                          className="absolute top-2 right-2 bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold hover:bg-orange-700"
                        >
                          ×
                        </button>
                        {existingPhotos.length === 0 && index === 0 && (
                          <span className="absolute bottom-2 left-2 bg-yellow-400 text-xs px-2 py-1 rounded font-bold text-gray-900">
                            Cover
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {totalPhotos < MAX_PHOTOS && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoChange}
                      className="w-full p-3 border border-gray-300 rounded-lg text-gray-800"
                      id="photo-upload"
                    />
                    <p className="text-xs text-gray-600 mt-2 font-medium">
                      Max {MAX_PHOTOS} photos. First photo = cover photo.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">Operating Hours</label>
                <textarea name="operating_hours" placeholder="Mon-Fri: 9AM-5PM" value={formData.operating_hours} onChange={handleChange} rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 font-medium" />
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <button onClick={prevStep} className="px-6 py-3 border-2 rounded-lg font-semibold"
                style={{ borderColor: brandColors.primary, color: brandColors.primary }}>← Previous</button>
            )}
            {currentStep < 5 ? (
              <button onClick={nextStep} className="px-6 py-3 text-white rounded-lg font-semibold ml-auto"
                style={{ backgroundColor: brandColors.primary }}>Next →</button>
            ) : (
              <button onClick={handleSubmit} disabled={saving || uploadingPhotos} className="px-6 py-3 text-white rounded-lg font-semibold ml-auto"
                style={{ backgroundColor: (saving || uploadingPhotos) ? '#9CA3AF' : brandColors.primary }}>
                {saving ? 'Saving...' : uploadingPhotos ? 'Uploading...' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
