/**
 * Data Loader API
 * Handles loading and combining JSON data with Google Places results
 */

export async function loadData() {
  try {
const response = await fetch(`${import.meta.env.BASE_URL}data/worldcup2026.json`);    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const jsonData = await response.json();

    // Combine all data types into a single array
    const allData = [
      ...jsonData.stadia.map(item => ({ ...item, type: 'stadium' })),
      ...jsonData.hotels.map(item => ({ ...item, type: 'hotel' })),
      ...jsonData.restaurants.map(item => ({ ...item, type: 'restaurant' })),
      ...jsonData.attractions.map(item => ({ ...item, type: 'attraction' }))
    ];

    // Try to enhance with Google Places data
    await enhanceWithGooglePlaces(allData);

    return allData;
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}

async function enhanceWithGooglePlaces(allData) {
  if (typeof google === 'undefined' || !google.maps) {
    console.log('Google Maps not available for Places enhancement');
    return;
  }

  const placesService = new google.maps.places.PlacesService(
    document.createElement('div')
  );

  const batchSize = 5;
  for (let i = 0; i < allData.length; i += batchSize) {
    const batch = allData.slice(i, i + batchSize);
    const promises = batch.map(item => {
      return new Promise((resolve) => {
        const location = new google.maps.LatLng(item.lat, item.lng);
        placesService.nearbySearch({
          location: location,
          radius: 100,
          keyword: item.name
        }, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
            const place = results[0];
            item.googlePlaceId = place.place_id;
            if (place.rating && place.rating > 0) {
              item.googleRating = place.rating;
            }
            if (place.vicinity) {
              item.googleAddress = place.vicinity;
            }
            if (place.types) {
              item.googleTypes = place.types;
            }
          }
          resolve();
        });
      });
    });

    await Promise.all(promises);
    if (i + batchSize < allData.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  console.log('Google Places enhancement complete');
}
