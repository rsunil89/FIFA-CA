/**
 * Currency Conversion API
 * Uses exchangerate-api.com for live rates with fallback
 */

const fallbackRates = {
  USD: { EUR: 0.92, GBP: 0.79, CAD: 1.36, MXN: 17.15 },
  EUR: { USD: 1.09, GBP: 0.86, CAD: 1.48, MXN: 18.65 },
  GBP: { USD: 1.27, EUR: 1.16, CAD: 1.72, MXN: 21.70 },
  CAD: { USD: 0.74, EUR: 0.68, GBP: 0.58, MXN: 12.61 },
  MXN: { USD: 0.058, EUR: 0.054, GBP: 0.046, CAD: 0.079 }
};

export async function convertCurrency(amount, from, to) {
  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
    if (!response.ok) throw new Error('Currency API request failed');
    
    const data = await response.json();
    const rate = data.rates[to];
    if (!rate) throw new Error(`Cannot convert ${from} to ${to}`);
    
    return parseFloat(amount) * rate;
  } catch (error) {
    console.error('Currency conversion error:', error);
    
    // Fallback rates
    if (fallbackRates[from] && fallbackRates[from][to]) {
      return parseFloat(amount) * fallbackRates[from][to];
    }
    throw error;
  }
}
