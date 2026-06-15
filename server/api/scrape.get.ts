// server/api/scrape.get.ts
import { defineEventHandler, getQuery, createError } from 'h3';
import * as cheerio from 'cheerio';
import { filterAndSortBranches } from '../../utils/branchSorter'

// ==========================================
// Typ-Definitionen (Aus deiner scraper.ts)
// ==========================================
export interface AvailabilityInfo {
  branch: string;
  status: string;
  shelfmark?: string;
}

export interface SearchResult {
  title: string;
  url?: string;
  mediaType?: string;
  author?: string;
  availability: AvailabilityInfo[];
}

export default defineEventHandler(async (event) => {
  const { id } = getQuery(event);

  if (!id || typeof id !== 'string' || !/^\d+$/.test(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Valid numeric VÖBB-ID is required.',
    });
  }

  const targetUrl = `https://www.voebb.de/aDISWeb/app/prod00?sp=SPROD00&sp=SAK${id}`;

  try {
    // 1. HTML via Server-side Fetch laden (CORS-Bypass)
    const response = await $fetch.raw(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8',
        'Cache-Control': 'no-cache',
      },
      timeout: 10000
    });

    const htmlContent = response._data as string;
    const $ = cheerio.load(htmlContent);

    // Validierungs-Check
    if (!htmlContent.includes('aDISWeb')) {
      return { success: false, error: 'Unexpected page structure from VÖBB.' };
    }

    // ==========================================
    // 2. METADATEN EXTRAHIEREN (Deine extractDetailMetadata Logik)
    // ==========================================
    let mediaType: string | undefined = undefined;
    let author: string | undefined = undefined;

    $('#R06 table.gi tr').each((_, el) => {
      const th = $(el).find('th');
      const td = $(el).find('td');

      if (th.length === 0 || td.length === 0) return;

      const leftText = th.text().trim();
      let rightText = td.text().trim().replace(/[\n\t\r]+/g, ' ').replace(/\s+/g, ' ');

      if (leftText.includes('Medienart')) {
        const bracketMatch = rightText.match(/\[(.*?)\]/);
        mediaType = bracketMatch ? bracketMatch[1].trim() : rightText;
      } 
      else if (leftText.includes('Verfasser') || leftText.includes('Person')) {
        author = rightText;
      }
    });

    // ==========================================
    // 3. TITEL EXTRAHIEREN (Deine extractTitleText Logik)
    // ==========================================
    let titleText = $('.adis-maintitle .html_div, #results h2 .html_div').first().text().trim();
    if (!titleText) {
      titleText = $('#results h2, h1').first().text().replace(/Aktuelle Seite:\s*/gi, '').trim();
    }
    titleText = titleText.replace(/[\n\t\r]+/g, ' ').replace(/\s+/g, ' ') || 'Unknown Title';

    // ==========================================
    // 4. KOPiERLINK / PERMALINK (Deine extractKopierlink Logik)
    // ==========================================
    const permanentUrl = $('.aDISListe a:contains("Kopierlink"), a.permalink-unclicked').first().attr('href') || targetUrl;

    // ==========================================
    // 5. VERFÜGBARKEITSTABELLE PARSEN (Deine parseAvailabilityTable Logik)
    // ==========================================
    const availability: AvailabilityInfo[] = [];
    const targetTable = $('.register-table table, .rTable_table, #resptable-1').first();

    if (targetTable.length > 0) {
      targetTable.find('tbody tr').each((_, el) => {
        const cells = $(el).find('td');
        if (cells.length < 4) return;

        const branchText = cells.eq(0).text().trim().replace(/\s+/g, ' ');
        const shelfmarkText = cells.eq(2).text().trim().replace(/\s+/g, ' ');
        const statusText = cells.last().text().trim().replace(/\s+/g, ' ');

        if (branchText.toLowerCase().includes('kopierlink') || branchText.toLowerCase().includes('[buch]')) {
          return; // Skip metadata rows
        }

        if (branchText && statusText) {
          availability.push({
            branch: branchText,
            status: statusText, // Fallback falls statusStatus leer
            shelfmark: shelfmarkText || undefined
          });
        }
      });
    }

    // ==========================================
    // 6. HYBRID SORTIERUNG & FILTERUNG
    // ==========================================
    // Wir lagern filterAndSortBranches im nächsten Schritt in den utils/-Ordner aus.
    // Für diesen ersten API-Test geben wir die rohe Liste zurück.
    const processedAvailability = filterAndSortBranches(availability); 

    const result: SearchResult = {
      title: titleText,
      url: permanentUrl,
      mediaType,
      author,
      availability: processedAvailability
    };

    return {
      success: true,
      data: result
    };

  } catch (error: any) {
    return {
      success: false,
      error: `VÖBB Fetch Failed: ${error.message || error}`,
      statusCode: error.statusCode || 500
    };
  }
});

