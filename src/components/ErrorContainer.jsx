import React from 'react';

function ErrorContainer({ message }) {
  return (
    <div id="rs_errorContainer" style={{
      position: 'fixed', top: '70px', right: '20px', zIndex: 3000, maxWidth: '400px'
    }}>
      {message && (
        <div className="rs_errorBanner">
          ⚠ {message}
        </div>
      )}
    </div>
  );
}

export default ErrorContainer;
