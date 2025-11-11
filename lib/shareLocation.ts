// lib/shareLocation.ts

interface ShareLocationParams {
  businessName: string;
  address: string;
  latitude: number;
  longitude: number;
  city: string;
}

/**
 * Share business location with proper map URL format that works on iPhone
 * Uses Apple Maps on iOS devices and Google Maps on others
 */
export async function shareBusinessLocation({
  businessName,
  address,
  latitude,
  longitude,
  city
}: ShareLocationParams): Promise<void> {
  // Construct the location URL
  // Apple Maps URL scheme for iOS devices
  const appleMapsUrl = `https://maps.apple.com/?q=${encodeURIComponent(businessName)}&ll=${latitude},${longitude}&address=${encodeURIComponent(address || city)}`;
  
  // Google Maps URL as fallback
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${encodeURIComponent(businessName)}`;

  // Detect if user is on iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const mapUrl = isIOS ? appleMapsUrl : googleMapsUrl;

  // Prepare share data
  const shareData = {
    title: businessName,
    text: `Check out ${businessName} in ${city}`,
    url: mapUrl
  };

  try {
    // Check if Web Share API is available
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    // Fallback: Copy to clipboard
    await navigator.clipboard.writeText(
      `${businessName}\n${address || city}\n${mapUrl}`
    );
    alert('Location link copied to clipboard!');
    
  } catch (error) {
    // If share fails, open map URL directly
    if (error instanceof Error && error.name === 'AbortError') {
      // User cancelled, do nothing
      return;
    }
    
    // Fallback: Open in new tab
    window.open(mapUrl, '_blank');
  }
}

/**
 * Alternative: Get shareable map URL based on device
 */
export function getMapUrl(latitude: number, longitude: number, businessName: string): string {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  if (isIOS) {
    // Apple Maps URL
    return `https://maps.apple.com/?q=${encodeURIComponent(businessName)}&ll=${latitude},${longitude}`;
  } else {
    // Google Maps URL
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  }
}

/**
 * Share with explicit directions
 */
export async function shareWithDirections({
  businessName,
  latitude,
  longitude,
  city
}: Omit<ShareLocationParams, 'address'>): Promise<void> {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  let directionsUrl: string;
  
  if (isIOS) {
    // Apple Maps with directions
    directionsUrl = `https://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`;
  } else {
    // Google Maps with directions
    directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  }

  const shareData = {
    title: `Directions to ${businessName}`,
    text: `Get directions to ${businessName} in ${city}`,
    url: directionsUrl
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    // Fallback: Open directly
    window.open(directionsUrl, '_blank');
    
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError') {
      window.open(directionsUrl, '_blank');
    }
  }
}
