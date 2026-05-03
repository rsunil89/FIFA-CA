import React from 'react';

function HeroSection() {
  return (
    <section id="rs_home" className="rs_hero">
      <div className="rs_heroContent">
        <h1 className="rs_heading1">FIFA World Cup 2026</h1>
        <p className="rs_heroSubtitle">
          Canada &bull; USA &bull; Mexico<br />
          June 11 - July 19, 2026
        </p>
        <p style={{ fontSize: '1.1rem', marginBottom: '30px', opacity: 0.9 }}>
          Your ultimate tourist guide to the greatest show on Earth!
          Explore stadiums, find hotels, discover restaurants, and plan your
          perfect World Cup adventure across three amazing host countries.
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#rs_mapSection" className="rs_btn rs_btnSecondary">Explore the Map</a>
          <a href="#rs_exploreSection" className="rs_btn rs_btnPrimary">Discover Places</a>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
