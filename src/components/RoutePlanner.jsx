import React from 'react';

function RoutePlanner() {
  return (
    <section id="rs_routeSection" className="rs_section">
      <div className="rs_container">
        <div className="rs_sectionTitle">
          <h2 className="rs_heading2">📍 Route Planner</h2>
          <p className="rs_text">Plan your journey between multiple locations. Add stops to create a custom route and see it displayed on the map.</p>
        </div>
        <div className="rs_routePlanner">
          <h3 className="rs_heading3">Your Route</h3>
          <p className="rs_textSmall" style={{ marginBottom: '15px' }}>
            Add at least 2 locations to calculate a route. You can add up to 8 stops.
          </p>
          <div id="rs_routeStops">
            <button id="rs_routeAddBtn" className="rs_routeAddBtn">
              + Add a stop to your route
            </button>
          </div>
          <div id="rs_routeSummary" style={{ marginTop: '15px' }}></div>
          <div id="rs_routeInstructions" style={{ marginTop: '15px' }}></div>
        </div>
      </div>
    </section>
  );
}

export default RoutePlanner;
