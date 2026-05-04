export function applyFilters(allData, filters, toggles) {
  const { type, country, search } = filters;
  const { showStadiums, showHotels, showRestaurants, showAttractions } = toggles;

  let filtered = [...allData];

  if (type !== 'all') {
    filtered = filtered.filter(item => item.type === type);
  }

  if (country !== 'all') {
    filtered = filtered.filter(item => item.country === country);
  }

  if (search && search.trim() !== '') {
    const searchLower = search.toLowerCase().trim();
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(searchLower) ||
      item.city.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      (item.cuisine && item.cuisine.toLowerCase().includes(searchLower))
    );
  }

  filtered = filtered.filter(item => {
    if (item.type === 'stadium' && !showStadiums) return false;
    if (item.type === 'hotel' && !showHotels) return false;
    if (item.type === 'restaurant' && !showRestaurants) return false;
    if (item.type === 'attraction' && !showAttractions) return false;
    return true;
  });

  return filtered;
}
