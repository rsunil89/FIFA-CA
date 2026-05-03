import React from 'react';

function LoadingSpinner() {
  return (
    <div id="rs_loadingSpinner" className="rs_spinner" style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(255,255,255,0.9)', zIndex: 5000, display: 'flex'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>⚽</div>
        <div style={{
          width: '40px', height: '40px', border: '4px solid #e0e0e0',
          borderTopColor: '#1a237e', borderRadius: '50%',
          animation: 'rs_spin 0.8s linear infinite', margin: '0 auto'
        }}></div>
        <p style={{ marginTop: '15px', color: '#666' }}>Loading World Cup 2026 Guide...</p>
      </div>
    </div>
  );
}

export default LoadingSpinner;
