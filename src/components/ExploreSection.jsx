import React, { useState } from 'react';

function ExploreSection({ data = [] }) {
  const [search, setSearch] = useState('');

  const filteredData = data.filter(item => {
    const text = `${item.name || ''} ${item.city || ''} ${item.country || ''} ${item.cuisine || ''} ${item.description || ''}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <section id="rs_exploreSection" className="rs_sectionAlt">
      <div className="rs_container">
        <div className="rs_sectionTitle">
          <h2 className="rs_heading2">🔍 Explore Locations</h2>
          <p className="rs_text">
            Browse through stadiums, hotels, restaurants, and attractions. Use the search bar to find specific places.
          </p>
        </div>

        <div className="rs_searchBar">
          <input
            type="text"
            className="rs_searchInput"
            placeholder="Search by name, city, cuisine..."
            aria-label="Search locations"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="rs_grid">
          {filteredData.map((item, index) => (
            <div className="rs_card" key={`${item.name}-${index}`}>
              <div className="rs_cardImage">
                {item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <span>Image not available</span>
                )}
              </div>

                <div className="rs_cardBody">
                  <h3>{item.name}</h3>
                  <span className="rs_badge">{item.type}</span>
                  <p>{item.description}</p>
                  <span>📍 {item.city || item.location || 'Location unavailable'}</span>
                </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ExploreSection;