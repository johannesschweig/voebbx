import express from 'express';
import { chromium } from 'playwright';

const app = express();

app.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Query required' });

  // Starten von Playwright mit sandboxed Flags für Docker/Cloud-Umgebungen
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  try {
    await page.goto('https://www.voebb.de/', { waitUntil: 'load' });

    const cookieButton = page.locator('button:has-text("Akzeptieren"), button:has-text("Erlauben"), button:has-text("Alles akzeptieren")').first();
    if (await cookieButton.isVisible()) {
      await cookieButton.click();
    }

    const searchInput = page.locator('input[type="search"], input[name="Query"], #search-input').first();
    await searchInput.waitFor({ timeout: 5000 });
    await searchInput.fill(q);

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'load', timeout: 15000 }).catch(() => { }),
      searchInput.press('Enter')
    ]);

    await page.waitForTimeout(1000);

    const linkLocator = page.locator('.rList_titel a');
    const count = await linkLocator.count();
    const searchResults = [];

    for (let i = 0; i < count; i++) {
      const currentLink = linkLocator.nth(i);
      const titleText = await currentLink.textContent() || '';
      const href = await currentLink.getAttribute('href') || '';
      const idMatch = href.match(/SAK(\d+)/);
      const id = idMatch ? idMatch[1] : '';

      if (!id) continue;

      // Dein historischer Filter gegen E-Ressourcen
      const rowContainer = currentLink.locator('xpath=ancestor::div[contains(@class, "rList_grid_wrapper")]');
      if (await rowContainer.count() > 0) {
        const availabilityImg = rowContainer.locator('.rList_availability img');
        if (await availabilityImg.count() > 0) {
          const altText = await availabilityImg.getAttribute('alt') || '';
          if (altText.toLowerCase().includes('siehe vollanzeige')) continue;
        }
      }

      let author = 'Unbekannter Verfasser';
      let mediaType = 'Medium';
      let availabilityText = 'Status unbekannt';

      try {
        if (await rowContainer.count() > 0) {
          const cells = rowContainer.locator('td');
          if (await cells.count() > 2) {
            author = await cells.nth(1).textContent() || author;
            mediaType = await cells.nth(2).textContent() || mediaType;
          }
          const availElement = rowContainer.locator('.rList_availability');
          if (await availElement.count() > 0) {
            availabilityText = await availElement.textContent() || availabilityText;
          }
        }
      } catch (e) {}

      searchResults.push({
        id,
        title: titleText.trim().replace(/\s+/g, ' '),
        author: author.trim().replace(/\s+/g, ' '),
        mediaType: mediaType.trim().replace(/\s+/g, ' '),
        availabilityText: availabilityText.trim().replace(/\s+/g, ' ')
      });
    }

    await browser.close();
    res.json({ success: true, results: searchResults });

  } catch (error) {
    await browser.close();
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Scraper running on port ${PORT}`));