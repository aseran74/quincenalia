export async function geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address + ', España'
      )}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();

    if (data.results && data.results[0]) {
      const { lat, lng } = data.results[0].geometry.location;
      return { latitude: lat, longitude: lng };
    }

    return null;
  } catch (error) {
    console.error('Error geocodificando dirección:', error);
    return null;
  }
} 