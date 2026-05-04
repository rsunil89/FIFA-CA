export async function loadData() {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/worldcup2026.json`);

    if (!response.ok) {
      throw new Error(`Could not load worldcup2026.json. Status: ${response.status}`);
    }

    const jsonData = await response.json();

    const allData = [
      ...(jsonData.stadia || []).map(item => ({ ...item, type: 'stadium' })),
      ...(jsonData.hotels || []).map(item => ({ ...item, type: 'hotel' })),
      ...(jsonData.restaurants || []).map(item => ({ ...item, type: 'restaurant' })),
      ...(jsonData.attractions || []).map(item => ({ ...item, type: 'attraction' }))
    ];

    return allData;
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}
