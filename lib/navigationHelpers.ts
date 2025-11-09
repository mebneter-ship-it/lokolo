// Helper function to open navigation in the user's preferred app
export const openNavigation = (latitude: number, longitude: number, businessName?: string) => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  
  const coords = `${latitude},${longitude}`;
  const label = businessName ? encodeURIComponent(businessName) : '';
  
  if (isIOS) {
    // iOS: Try Apple Maps first, fallback to Google Maps
    const appleMapsUrl = `maps://? q=${label}&ll=${coords}`;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords}&destination_place_id=${label}`;
    
    // Try Apple Maps
    window.location.href = appleMapsUrl;
    
    // Fallback to Google Maps after a delay if Apple Maps didn't open
    setTimeout(() => {
      window.open(googleMapsUrl, '_blank');
    }, 500);
    
  } else if (isAndroid) {
    // Android: Use Google Maps intent or web
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords}&destination_place_id=${label}`;
    window.open(googleMapsUrl, '_blank');
    
  } else {
    // Desktop: Open Google Maps in new tab
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords}`;
    window.open(googleMapsUrl, '_blank');
  }
};

// Helper to share business location
export const shareLocation = async (businessName: string, latitude: number, longitude: number, address?: string) => {
  const text = `${businessName}${address ? ` - ${address}` : ''}`;
  const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: businessName,
        text: text,
        url: url
      });
    } catch (err) {
      // User cancelled or error
      console.log('Share cancelled');
    }
  } else {
    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      alert('Location copied to clipboard!');
    } catch (err) {
      // Fallback: Open in new window
      window.open(url, '_blank');
    }
  }
};
