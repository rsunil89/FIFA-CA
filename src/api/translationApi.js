export async function translateText(text, sourceLang, targetLang) {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_TRANSLATION_API_KEY;

    if (!apiKey) {
      throw new Error('Google Translation API key is not configured');
    }

    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang,
          format: 'text'
        })
      }
    );

    if (!response.ok) throw new Error('Translation API request failed');

    const data = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}
