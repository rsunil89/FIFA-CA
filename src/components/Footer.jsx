import React from 'react';

function Footer() {
  return (
    <footer className="rs_footer">
      <div className="rs_footerContent">
        <div>
          <h4 className="rs_footerTitle">About WC2026 Guide</h4>
          <p className="rs_footerText">
            Your comprehensive tourist guide for the FIFA World Cup 2026,
            hosted across Canada, the United States, and Mexico.
            Plan your trip with our interactive map, route planner,
            and travel tools.
          </p>
        </div>
        <div>
          <h4 className="rs_footerTitle">Quick Links</h4>
          <a href="#rs_home" className="rs_footerLink">Home</a>
          <a href="#rs_mapSection" className="rs_footerLink">Interactive Map</a>
          <a href="#rs_exploreSection" className="rs_footerLink">Explore Locations</a>
          <a href="#rs_routeSection" className="rs_footerLink">Route Planner</a>
          <a href="#rs_toolsSection" className="rs_footerLink">Travel Tools</a>
        </div>
        <div>
          <h4 className="rs_footerTitle">Host Countries</h4>
          <a href="#" className="rs_footerLink">🇺🇸 United States (11 venues)</a>
          <a href="#" className="rs_footerLink">🇨🇦 Canada (2 venues)</a>
          <a href="#" className="rs_footerLink">🇲🇽 Mexico (3 venues)</a>
        </div>
        <div>
          <h4 className="rs_footerTitle">Tournament Info</h4>
          <p className="rs_footerText">
            FIFA World Cup 2026<br />
            June 11 - July 19, 2026<br />
            48 teams | 16 venues<br />
            3 host countries
          </p>
        </div>
      </div>
      <div className="rs_footerBottom">
        <p>&copy; 2026 World Cup Tourist Guide. Created by Ryan Stanley (rs).
          This is a student project for educational purposes.</p>
      </div>
    </footer>
  );
}

export default Footer;
