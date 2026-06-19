import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const app = express();

app.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Query required' });

  try {
    // 1. Frischer Cookie-Jar für jeden isolierten Request
    const jar = new CookieJar();
    const client = wrapper(axios.create({ jar }));

    // PHASE 1: Session & Anti-CSRF-Token holen
    const initialRes = await client.get('https://www.voebb.de/aDISWeb/app/prod00');
    const $home = cheerio.load(initialRes.data);

    const identity = $home('input[name="identity"]').val();
    const formAction = $home('form').first().attr('action');
    
    if (!identity || !formAction) {
      throw new Error("Session-Token oder Action-URL nicht gefunden.");
    }
    
    const postUrl = new URL(formAction, 'https://www.voebb.de/aDISWeb/app/prod00').href;

    // PHASE 2: Suchanfrage abschicken (Axios folgt dem 303-Redirect automatisch)
    const params = new URLSearchParams();
    params.append('identity', identity);
    params.append('keyCode', '82');
    params.append('focus', '$$GFBO_1');
    params.append('requestCount', '1');
    params.append('scriptEnabled', 'true');
    params.append('$Autosuggest', q);
    params.append('$Select', 'Überall suchen');
    params.append('$Button', 'pressed');

    const searchRes = await client.post(postUrl, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': initialRes.request.res.responseUrl,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    // PHASE 3: HTML der Ergebnisseite parsen
    const $ = cheerio.load(searchRes.data);
    const searchResults = [];

    $('.rList_titel a').each((i, el) => {
      const titleText = $(el).text() || '';
      const href = $(el).attr('href') || '';
      const idMatch = href.match(/SAK(\d+)/);
      const id = idMatch ? idMatch[1] : '';

      if (!id) return;

      // Filter gegen E-Ressourcen (Online-Angebote ausschließen)
      const rowContainer = $(el).closest('.rList_grid_wrapper');
      if (rowContainer.length > 0) {
        const altText = rowContainer.find('.rList_availability img').attr('alt') || '';
        if (altText.toLowerCase().includes('siehe vollanzeige')) return; 
      }

      searchResults.push({
        id,
        title: titleText.trim().replace(/\s+/g, ' '),
      });
    });

    // Erfolg zurückgeben
    res.json({ success: true, results: searchResults });

  } catch (error) {
    console.error("Scraping Fehler:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API läuft stabil und pfeilschnell auf Port ${PORT}`);
});