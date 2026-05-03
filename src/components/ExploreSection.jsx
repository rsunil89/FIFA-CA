import React from 'react';

function ExploreSection() {
  return (
    <section id="rs_exploreSection" className="rs_sectionAlt">
      <div className="rs_container">
        <div className="rs_sectionTitle">
          <h2 className="rs_heading2">🔍 Explore Locations</h2>
          <p className="rs_text">Browse through stadiums, hotels, restaurants, and attractions. Use the search bar to find specific places.</p>
        </div>
        <div className="rs_searchBar">
          <input type="text" id="rs_searchInput" className="rs_searchInput"
            placeholder="Search by name, city, cuisine..." aria-label="Search locations" />
        </div>
        <div id="rs_contentGrid" className="rs_grid">
          {/* Cards will be dynamically inserted here by JavaScript */}
        </div>
      </div>
    </section>
  );
}

export default ExploreSection;
