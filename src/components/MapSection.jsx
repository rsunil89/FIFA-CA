import React, { useEffect, useRef } from 'react';

function MapSection() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (typeof google === 'undefined' || !google.maps || mapInstanceRef.current) return;

    const center = { lat: 39.8283, lng: -98.5795 };
    const map = new google.maps.Map(mapRef.current, {
      center: center,
      zoom: 4,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true
    });

    mapInstanceRef.current = map;
  }, []);

  return (
    <section id="rs_mapSection" className="rs_section">
      <div className="rs_container">
        <div className="rs_sectionTitle">
          <h2 className="rs_heading2">🗺 Interactive Map</h2>
          <p className="rs_text">Click on markers to learn more about each location. Use the controls below to filter and customize your view.</p>
        </div>
        <div className="rs_mapControls">
          <div className="rs_filterGroup">
            <span className="rs_filterLabel">Type:</span>
            <button className="rs_filterBtn rs_filterBtnActive" data-filter-type="type" data-filter-value="all">All</button>
            <button className="rs_filterBtn" data-filter-type="type" data-filter-value="stadium">Stadiums</button>
            <button className="rs_filterBtn" data-filter-type="type" data-filter-value="hotel">Hotels</button>
            <button className="rs_filterBtn" data-filter-type="type" data-filter-value="restaurant">Restaurants</button>
            <button className="rs_filterBtn" data-filter-type="type" data-filter-value="attraction">Attractions</button>
          </div>
          <div className="rs_filterGroup">
            <span className="rs_filterLabel">Country:</span>
            <button className="rs_filterBtn rs_filterBtnActive" data-filter-type="country" data-filter-value="all">All</button>
            <button className="rs_filterBtn" data-filter-type="country" data-filter-value="USA">🇺🇸 USA</button>
            <button className="rs_filterBtn" data-filter-type="country" data-filter-value="Canada">🇨🇦 Canada</button>
            <button className="rs_filterBtn" data-filter-type="country" data-filter-value="Mexico">🇲🇽 Mexico</button>
          </div>
          <div className="rs_toggleGroup">
            <button className="rs_toggleBtn rs_toggleBtnActive" data-toggle-type="stadiums">⚽ Stadiums</button>
            <button className="rs_toggleBtn rs_toggleBtnActive" data-toggle-type="hotels">🏨 Hotels</button>
            <button className="rs_toggleBtn rs_toggleBtnActive" data-toggle-type="restaurants">🍽 Restaurants</button>
            <button className="rs_toggleBtn rs_toggleBtnActive" data-toggle-type="attractions">📍 Attractions</button>
          </div>
        </div>
        <div className="rs_mapWrapper">
          <div id="rs_map" className="rs_mapContainer" ref={mapRef}></div>
        </div>
      </div>
    </section>
  );
}

export default MapSection;
