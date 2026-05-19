import { chromium, Page } from '@playwright/test';
import { NEARBY_LIBRARIES_ORDER } from './distanceConfig';

// ==========================================
// Type Definitions
// ==========================================
export interface AvailabilityInfo {
  branch: string;
  status: string;
  shelfmark?: string;
}

export interface SearchResult {
  title: string;
  url?: string;
  availability: AvailabilityInfo[];
}

// ==========================================
// 1. Search & Navigation Utilities
// ==========================================
async function handleCookieBanner(page: Page): Promise<void> {
  const cookieButton = page.locator('button:has-text("Akzeptieren"), button:has-text("Erlauben")').first();
  if (await cookieButton.isVisible()) {
    await cookieButton.click();
  }
}

async function executeSearchQuery(page: Page, query: string): Promise<void> {
  const searchInput = page.locator('input[type="search"], input[name="Query"], #search-input').first();
  await searchInput.waitFor({ timeout: 5000 });
  await searchInput.fill(query);

  console.log(`[voebbx] Submitting query...`);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'load', timeout: 15000 }).catch(() => {}),
    searchInput.press('Enter')
  ]);
}

// ==========================================
// 2. List View Extractors
// ==========================================
async function extractPrintTargetUrls(page: Page): Promise<string[]> {
  const linkLocator = page.locator('.rList_titel a');
  await linkLocator.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  
  const count = await linkLocator.count();
  const targetUrls: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const currentLink = linkLocator.nth(i);
    
    // Evaluate parent text context to safely filter media formats out of the pipeline
    const rowText = await currentLink.evaluate(el => el.closest('.rList_li, tr, li')?.textContent || '');
    const lowerText = rowText.toLowerCase();

    if (
      lowerText.includes('e-medium') || 
      lowerText.includes('online-ressource') || 
      lowerText.includes('download') || 
      lowerText.includes('e-book')
    ) {
      console.log(`[voebbx] Skipping digital asset row at listing index ${i + 1}`);
      continue;
    }

    const href = await currentLink.getAttribute('href');
    if (href) {
      const fullUrl = href.startsWith('http') ? href : `https://www.voebb.de${href}`;
      targetUrls.push(fullUrl);
    }
  }
  return targetUrls;
}

// ==========================================
// 3. Detail View Parsers
// ==========================================
async function extractTitleText(page: Page, fallbackQuery: string): Promise<string> {
  const titleContainer = page.locator('.adis-maintitle .html_div, #results h2 .html_div').first();
  if (await titleContainer.isVisible()) {
    const rawTitle = await titleContainer.textContent() || '';
    return rawTitle.trim().replace(/[\n\t\r]+/g, ' ').replace(/\s+/g, ' ');
  }
  
  const fallbackHeader = page.locator('#results h2, h1').first();
  if (await fallbackHeader.isVisible()) {
    const rawTitle = await fallbackHeader.textContent() || '';
    return rawTitle.replace(/Aktuelle Seite:\s*/gi, '').trim().replace(/[\n\t\r]+/g, ' ').replace(/\s+/g, ' ');
  }
  
  return fallbackQuery;
}

async function extractKopierlink(page: Page): Promise<string | undefined> {
  try {
    const permalinkAnchor = page.locator('.aDISListe a:has-text("Kopierlink"), a.permalink-unclicked').first();
    await permalinkAnchor.waitFor({ state: 'attached', timeout: 3000 });
    return await permalinkAnchor.getAttribute('href') || undefined;
  } catch (e) {
    console.log(`[voebbx] Could not extract permanent Kopierlink.`);
    return undefined;
  }
}

async function parseAvailabilityTable(page: Page): Promise<AvailabilityInfo[]> {
  const list: AvailabilityInfo[] = [];
  const targetTable = page.locator('.register-table table, .rTable_table, #resptable-1').first();

  if (!(await targetTable.isVisible())) {
    console.log(`[voebbx] Warning: No physical availability matrix table found on page.`);
    return list;
  }
  
  try {
    const rows = targetTable.locator('tbody tr');
    await rows.first().waitFor({ state: 'visible', timeout: 5000 });
    const rowCount = await rows.count();

    for (let i = 0; i < rowCount; i++) {
      const cells = rows.nth(i).locator('td');
      if (await cells.count() < 4) continue;

      const branchText = await cells.nth(0).textContent() || '';
      const shelfmarkText = await cells.nth(2).textContent() || '';
      const statusText = await cells.last().textContent() || '';

      const cleanBranch = branchText.trim().replace(/\s+/g, ' ');
      const cleanStatus = statusText.trim().replace(/\s+/g, ' ');
      const cleanShelf = shelfmarkText.trim().replace(/\s+/g, ' ');

      if (cleanBranch.toLowerCase().includes('kopierlink') || cleanBranch.toLowerCase().includes('[buch]')) {
        continue;
      }

      if (cleanBranch && cleanStatus) {
        list.push({
          branch: cleanBranch,
          status: cleanStatus,
          shelfmark: cleanShelf || undefined
        });
      }
    }
  } catch (err) {
    console.log(`[voebbx] Timeout or breakdown parsing availability rows.`);
  }

  return list;
}

// ==========================================
// 4. Data Transformation Utilities
// ==========================================
function filterAndSortBranches(rawAvailability: AvailabilityInfo[]): AvailabilityInfo[] {
  return rawAvailability
    .map(item => {
      const matchedIndex = NEARBY_LIBRARIES_ORDER.findIndex(nearbyName => 
        item.branch.toLowerCase().includes(nearbyName.toLowerCase())
      );
      return { ...item, sortIndex: matchedIndex };
    })
    .filter(item => {
      const isKeep = item.sortIndex !== -1;
      // if (!isKeep) {
      //   console.log(`[voebbx] Filtered out far branch: "${item.branch}" (>10km)`);
      // }
      return isKeep;
    })
    .sort((a, b) => a.sortIndex - b.sortIndex)
    .map(({ sortIndex, ...cleanItem }) => cleanItem);
}

// ==========================================
// 5. Orchestrators & Worker Methods
// ==========================================
async function crawlDetailPage(page: Page, url: string, query: string): Promise<SearchResult | null> {
  try {
    console.log(`[voebbx] Navigating to detail page: ${url}`);
    await page.goto(url, { waitUntil: 'load', timeout: 15000 });
    
    const titleText = await extractTitleText(page, query);
    const permanentUrl = await extractKopierlink(page) || url;
    const rawAvailability = await parseAvailabilityTable(page);
    
    const processedAvailability = filterAndSortBranches(rawAvailability);

    return {
      title: titleText,
      url: permanentUrl,
      availability: processedAvailability
    };
  } catch (crawlError) {
    console.error(`[voebbx] Failed tracking down assets on page ${url}:`, crawlError.message || crawlError);
    return null;
  }
}

export async function searchVoebb(query: string): Promise<SearchResult[]> {
  const browser = await chromium.launch({ headless: true });  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }, 
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  try {
    console.log(`[voebbx] Launching voebb.de...`);
    await page.goto('https://www.voebb.de/', { waitUntil: 'load' });

    await handleCookieBanner(page);
    await executeSearchQuery(page, query);

    // Give asynchronous table listings a split second to stabilize
    await page.waitForTimeout(1000);
    await page.waitForLoadState('networkidle');
    
    const targetUrls = await extractPrintTargetUrls(page);
    console.log(`[voebbx] Found ${targetUrls.length} valid print item records to evaluate.`);
    
    const results: SearchResult[] = [];

    // Process pages sequentially over the persistent active layout view page tab context
    for (const url of targetUrls) {
      const searchResult = await crawlDetailPage(page, url, query);
      if (searchResult) {
        results.push(searchResult);
      }
    }

    await browser.close();
    return results;

  } catch (error) {
    await page.screenshot({ path: 'error-screenshot.png' }).catch(() => {});
    await browser.close();
    console.error('[voebbx] General Execution Failure:', error.message || error);
    throw error;
  }
}
