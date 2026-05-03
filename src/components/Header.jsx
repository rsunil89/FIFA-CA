import React, { useState } from 'react';

function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const toggleMobileNav = () => setMobileNavOpen(!mobileNavOpen);
  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <>
      <header className="rs_header" id="rs_header">
        <div className="rs_headerContent">
          <div className="rs_logo">
            <span className="rs_logoIcon">⚽</span>
            <span>WC2026 Guide</span>
          </div>
          <nav className="rs_nav" id="rs_nav">
            <a href="#rs_home" className="rs_navLink rs_navLinkActive" onClick={closeMobileNav}>Home</a>
            <a href="#rs_mapSection" className="rs_navLink" onClick={closeMobileNav}>Map</a>
            <a href="#rs_exploreSection" className="rs_navLink" onClick={closeMobileNav}>Explore</a>
            <a href="#rs_routeSection" className="rs_navLink" onClick={closeMobileNav}>Route Planner</a>
            <a href="#rs_toolsSection" className="rs_navLink" onClick={closeMobileNav}>Travel Tools</a>
          </nav>
          <button
            className={`rs_hamburgerBtn ${mobileNavOpen ? 'rs_hamburgerOpen' : ''}`}
            id="rs_hamburgerBtn"
            aria-label="Toggle navigation menu"
            onClick={toggleMobileNav}
          >
            <span className="rs_hamburgerLine"></span>
            <span className="rs_hamburgerLine"></span>
            <span className="rs_hamburgerLine"></span>
          </button>
        </div>
      </header>

      <nav className={`rs_mobileNav ${mobileNavOpen ? 'rs_mobileNavOpen' : ''}`} id="rs_mobileNav">
        <a href="#rs_home" className="rs_mobileNavLink rs_mobileNavLinkActive" onClick={closeMobileNav}>🏠 Home</a>
        <a href="#rs_mapSection" className="rs_mobileNavLink" onClick={closeMobileNav}>🗺 Map</a>
        <a href="#rs_exploreSection" className="rs_mobileNavLink" onClick={closeMobileNav}>🔍 Explore</a>
        <a href="#rs_routeSection" className="rs_mobileNavLink" onClick={closeMobileNav}>📍 Route Planner</a>
        <a href="#rs_toolsSection" className="rs_mobileNavLink" onClick={closeMobileNav}>🛠 Travel Tools</a>
      </nav>

      <div
        className={`rs_overlay ${mobileNavOpen ? 'rs_overlayVisible' : ''}`}
        id="rs_overlay"
        onClick={closeMobileNav}
      ></div>
    </>
  );
}

export default Header;
