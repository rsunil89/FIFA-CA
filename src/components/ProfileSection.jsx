import React from 'react';

function ProfileSection() {
  return (
    <section id="rs_profileSection" className="rs_section rs_profileSection">
      <div className="rs_container">
        <div className="rs_sectionTitle">
          <h2 className="rs_heading2">👤 My Profile</h2>
          <p className="rs_text">Create an account to save your preferences, plan your World Cup journey, and manage your profile.</p>
        </div>
        <div id="rs_profileContent" className="rs_profileContent">
          {/* Content is dynamically populated by profile.js */}
        </div>
      </div>
    </section>
  );
}

export default ProfileSection;
