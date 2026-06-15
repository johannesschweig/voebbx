// server/api/search.get.ts
import { defineEventHandler, getQuery, createError } from 'h3';
import { chromium } from 'playwright';

export interface SearchResultItem {
  id: string;
  title: string;
}

export default defineEventHandler(async (event) => {
  const { q } = getQuery(event);

  if (!q || typeof q !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Search query "q" is required.',
    });
  }

  // Headless-Browser exakt wie in deinem alten funktionierenden Skript konfigurieren
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  try {
    // 1. VÖBB Startseite aufrufen
    await page.goto('https://www.voebb.de/', { waitUntil: 'load' });

    // 2. Cookie Banner mit deinen alten Selektoren wegklicken
    const cookieButton = page.locator('button:has-text("Akzeptieren"), button:has-text("Erlauben"), button:has-text("Alles akzeptieren")').first();
    if (await cookieButton.isVisible()) {
      await cookieButton.click();
    }

    // 3. Suchfeld mit deinen funktionierenden Selektoren anvisieren
    const searchInput = page.locator('input[type="search"], input[name="Query"], #search-input').first();
    await searchInput.waitFor({ timeout: 5000 });
    await searchInput.fill(q);

    // 4. Suche absenden und synchron auf die Navigation warten (exakt wie im funktionierenden Skript)
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'load', timeout: 15000 }).catch(() => { }),
      searchInput.press('Enter')
    ]);

    // Dem dynamischen Layout eine Winzigkeit Zeit geben sich zu setzen
    await page.waitForTimeout(1000);

    // 5. Ergebnisse aus der Liste extrahieren (.rList_titel a)
    const linkLocator = page.locator('.rList_titel a');
    const count = await linkLocator.count();
    const searchResults: SearchResultItem[] = [];

    for (let i = 0; i < count; i++) {
      const currentLink = linkLocator.nth(i);
      const titleText = await currentLink.textContent() || '';
      const href = await currentLink.getAttribute('href') || '';

      const idMatch = href.match(/SAK(\d+)/);
      const id = idMatch ? idMatch[1] : '';

      if (!id) continue;

      // filter out e resources
      const rowContainer = currentLink.locator('xpath=ancestor::div[contains(@class, "rList_grid_wrapper")]');

      if (await rowContainer.count() > 0) {
        const availabilityImg = rowContainer.locator('.rList_availability img').first();

        if (await availabilityImg.count() > 0) {
          const altText = await availabilityImg.getAttribute('alt') || '';

          if (altText.toLowerCase().includes('siehe vollanzeige')) {
            continue; // Überspringt E-Ressourcen / Serien ohne Bestandsdaten
          }
        }
      }


      searchResults.push({
        id,
        title: titleText.trim().replace(/\s+/g, ' '),
      });
    }

    await browser.close();

    return {
      success: true,
      results: searchResults
    };

  } catch (error: any) {
    await browser.close();
    return {
      success: false,
      error: `VÖBB Search Failed: ${error.message || error}`
    };
  }
});