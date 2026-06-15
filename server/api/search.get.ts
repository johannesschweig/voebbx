import { defineEventHandler, getQuery, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const { q } = getQuery(event);

  if (!q || typeof q !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Query required' });
  }

  // Nutze die Render-URL im Live-Betrieb, lokal bleibt der Fallback
  const SCRAPER_BASE_URL = process.env.SCRAPER_URL || 'http://localhost:3001';

  try {
    // Leitet die Anfrage an deinen kostenlosen Render-Container weiter
    const response: any = await $fetch(`${SCRAPER_BASE_URL}/search`, {
      query: { q }
    });
    return response;
  } catch (error: any) {
    return {
      success: false,
      error: `Remote Search Failed: ${error.message || error}`
    };
  }
});