import React from 'react';

function TravelTools() {
  return (
    <section id="rs_toolsSection" className="rs_sectionAlt">
      <div className="rs_container">
        <div className="rs_sectionTitle">
          <h2 className="rs_heading2">🛠 Travel Tools</h2>
          <p className="rs_text">Useful tools for your World Cup journey. Convert currencies between host countries and translate text on the go.</p>
        </div>
        <div className="rs_apiTools">
          <div className="rs_apiToolCard">
            <h3 className="rs_apiToolTitle">💰 Currency Converter</h3>
            <p className="rs_textSmall" style={{ marginBottom: '15px' }}>
              Convert between US Dollar (USD), Canadian Dollar (CAD), Mexican Peso (MXN),
              Euro (EUR), and British Pound (GBP).
            </p>
            <div className="rs_formGroup">
              <label className="rs_formLabel" htmlFor="rs_currencyAmount">Amount</label>
              <input type="number" id="rs_currencyAmount" className="rs_formInput"
                placeholder="Enter amount" min="0" step="0.01" defaultValue="100" />
            </div>
            <div className="rs_formGroup">
              <label className="rs_formLabel" htmlFor="rs_currencyFrom">From</label>
              <select id="rs_currencyFrom" className="rs_formSelect">
                <option value="USD">🇺🇸 US Dollar (USD)</option>
                <option value="CAD">🇨🇦 Canadian Dollar (CAD)</option>
                <option value="MXN">🇲🇽 Mexican Peso (MXN)</option>
                <option value="EUR">🇪🇺 Euro (EUR)</option>
                <option value="GBP">🇬🇧 British Pound (GBP)</option>
              </select>
            </div>
            <div className="rs_formGroup">
              <label className="rs_formLabel" htmlFor="rs_currencyTo">To</label>
              <select id="rs_currencyTo" className="rs_formSelect">
                <option value="USD">🇺🇸 US Dollar (USD)</option>
                <option value="CAD" selected>🇨🇦 Canadian Dollar (CAD)</option>
                <option value="MXN">🇲🇽 Mexican Peso (MXN)</option>
                <option value="EUR">🇪🇺 Euro (EUR)</option>
                <option value="GBP">🇬🇧 British Pound (GBP)</option>
              </select>
            </div>
            <button id="rs_convertBtn" className="rs_btn rs_btnPrimary" style={{ width: '100%' }}>
              Convert Currency
            </button>
            <div id="rs_currencyResult" className="rs_apiToolResult">
              Enter an amount and click Convert
            </div>
          </div>
          <div className="rs_apiToolCard">
            <h3 className="rs_apiToolTitle">🌐 Language Translator</h3>
            <p className="rs_textSmall" style={{ marginBottom: '15px' }}>
              Translate text between English, Spanish, French, and more.
              Useful for communicating across the three host countries.
            </p>
            <div className="rs_formGroup">
              <label className="rs_formLabel" htmlFor="rs_translateText">Text to Translate</label>
              <textarea id="rs_translateText" className="rs_formInput" rows="3"
                placeholder="Enter text to translate..."
                style={{ resize: 'vertical' }} defaultValue="Hello, where is the nearest stadium?"></textarea>
            </div>
            <div className="rs_formGroup">
              <label className="rs_formLabel" htmlFor="rs_translateFrom">From</label>
              <select id="rs_translateFrom" className="rs_formSelect">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
              </select>
            </div>
            <div className="rs_formGroup">
              <label className="rs_formLabel" htmlFor="rs_translateTo">To</label>
              <select id="rs_translateTo" className="rs_formSelect">
                <option value="es">Spanish</option>
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
              </select>
            </div>
            <button id="rs_translateBtn" className="rs_btn rs_btnPrimary" style={{ width: '100%' }}>
              Translate Text
            </button>
            <div id="rs_translateResult" className="rs_apiToolResult">
              Enter text and click Translate
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TravelTools;
