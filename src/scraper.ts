import { chromium, Page } from '@playwright/test';
import { NEARBY_LIBRARIES_ORDER } from './distanceConfig';

export interface AvailabilityInfo {
  branch: string;
  status: string;
  shelfmark?: string;
}

export interface SearchResult {
  title: string;
  url?: string
  availability: AvailabilityInfo[];
}

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

async function locateAndNavigateToAsset(page: Page, query: string): Promise<void> {
  await page.waitForSelector('#container', { timeout: 15000 });
  console.log(`[voebbx] Hunting for physical text matches inside container...`);

  const cleanQuery = query.replace(/["']/g, ''); 
  const targetLinks = page.locator(`.rList_titel a`);
  const linksCount = await targetLinks.count();

  let targetLink = targetLinks.first();
  let foundPhysicalBook = false;

  for (let i = 0; i < linksCount; i++) {
    const currentLink = targetLinks.nth(i);
    const rowText = await currentLink.evaluate(el => el.closest('tr, li, .grid-row')?.textContent || '');
    
    if (!rowText.toLowerCase().includes('e-medium') && 
        !rowText.toLowerCase().includes('online-ressource') && 
        !rowText.toLowerCase().includes('download')) {
      targetLink = currentLink;
      foundPhysicalBook = true;
      console.log(`[voebbx] Filtered out e-media. Found print match at index: ${i + 1}`);
      break;
    }
  }

  if (!(await targetLink.isVisible())) {
    console.log(`[voebbx] No clean matching records found. Checking fallback tables...`);
    const fallbackLink = page.locator('#container table tr td a').first();
    if (await fallbackLink.isVisible()) {
      await fallbackLink.click();
    } else {
      throw new Error('Core link matrix completely unrecognized.');
    }
  } else {
    await targetLink.click();
  }
}

async function extractTitleText(page: Page, query: string): Promise<string> {
  // Target the innermost layout div first to avoid pulling hidden accessibility tags
  const titleContainer = page.locator('.adis-maintitle .html_div, #results h2 .html_div').first();
  
  if (await titleContainer.isVisible()) {
    const rawTitle = await titleContainer.textContent() || '';
    return rawTitle.trim().replace(/[\n\t\r]+/g, ' ').replace(/\s+/g, ' ');
  }
  
  // Fallback to standard headings if the div matrix isn't present
  const fallbackHeader = page.locator('#results h2, h1').first();
  if (await fallbackHeader.isVisible()) {
    const rawTitle = await fallbackHeader.textContent() || '';
    return rawTitle.replace(/Aktuelle Seite:\s*/gi, '').trim().replace(/[\n\t\r]+/g, ' ').replace(/\s+/g, ' ');
  }
  
  return query;
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
    await locateAndNavigateToAsset(page, query);

    // Dynamic rendering buffer window
    await page.waitForTimeout(1000);
    await page.waitForLoadState('networkidle');
    
    // Resolve Page Meta Attributes
    const titleText = await extractTitleText(page, query);
    const permanentUrl = await extractKopierlink(page);
    console.log(`[voebbx] Active Target: "${titleText}" | Link: ${permanentUrl}`);

    // Parse the actual target physical table data matrix
    const availability = await parseAvailabilityTable(page);
    await browser.close();

    if (availability.length > 0) {
      console.log(`[voebbx] Raw scraped branches: ${availability.map(a => a.branch).join(', ')}`);
    }

    // Run custom 10km Filter & Sort calculations
    const filteredAndSortedAvailability = availability
      .map(item => {
        const matchedIndex = NEARBY_LIBRARIES_ORDER.findIndex(nearbyName => 
          item.branch.toLowerCase().includes(nearbyName.toLowerCase())
        );
        return { ...item, sortIndex: matchedIndex };
      })
      .filter(item => {
        const isKeep = item.sortIndex !== -1;
        if (!isKeep) {
          console.log(`[voebbx] Filtered out far branch: "${item.branch}" (>10km)`);
        }
        return isKeep;
      })
      .sort((a, b) => a.sortIndex - b.sortIndex)
      .map(({ sortIndex, ...cleanItem }) => cleanItem);

    return [{ 
      title: titleText, 
      url: permanentUrl,
      availability: filteredAndSortedAvailability
    }];

  } catch (error) {
    await page.screenshot({ path: 'error-screenshot.png' }).catch(() => {});
    await browser.close();
    console.error('[voebbx] Pipeline Execution Failed:', error.message || error);
    throw error;
  }
}

/**
 * Processes the explicit responsive data table on the item detail page.
 */
async function parseAvailabilityTable(page: Page): Promise<AvailabilityInfo[]> {
  const list: AvailabilityInfo[] = [];

  console.log(`[voebbx] Looking specifically for the real branch asset table...`);
  
  // Strict selector targeting ONLY the real inventory grid, ignoring the header tables
  const targetTable = page.locator('.register-table table, .rTable_table, #resptable-1').first();

  if (await targetTable.isVisible()) {
    console.log(`[voebbx] Found real branch availability grid. Waiting for data...`);
    
    try {
      // Wait for an actual row with a link inside the body to ensure it's painted
      const firstDataRow = targetTable.locator('tbody tr').first();
      await firstDataRow.waitFor({ state: 'visible', timeout: 5000 });
      
      const rows = targetTable.locator('tbody tr');
      const rowCount = await rows.count();
      console.log(`[voebbx] Processing ${rowCount} physical branch rows...`);

      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const cells = row.locator('td');
        const cellCount = await cells.count();

        // Skip layout rows or empty state updates
        if (cellCount < 4) continue;

        // Using explicit column mappings matching the real grid layout
        const branchText = await cells.nth(0).textContent() || '';
        const shelfmarkText = await cells.nth(2).textContent() || '';
        const statusText = await cells.last().textContent() || ''; // Grab the last cell (Availability)

        const cleanBranch = branchText.trim().replace(/\s+/g, ' ');
        const cleanStatus = statusText.trim().replace(/\s+/g, ' ');
        const cleanShelf = shelfmarkText.trim().replace(/\s+/g, ' ');

        // Skip accidental meta headers if they somehow bypass selectors
        if (cleanBranch.toLowerCase().includes('kopierlink') || cleanBranch.toLowerCase().includes('[buch]')) {
          continue;
        }

        //console.log(`[voebbx] Live Asset Row ${i + 1} -> Branch: "${cleanBranch}", Status: "${cleanStatus}"`);

        if (cleanBranch && cleanStatus) {
          list.push({
            branch: cleanBranch,
            status: cleanStatus,
            shelfmark: cleanShelf || undefined
          });
        }
      }
    } catch (waitError) {
      console.log(`[voebbx] Timeout waiting for real table rows to render.`);
    }
  } else {
    console.log(`[voebbx] Error: Could not find a table matching the physical asset criteria.`);
  }

  return list;
}
