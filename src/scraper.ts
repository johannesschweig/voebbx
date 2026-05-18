import { chromium, Page } from '@playwright/test';

export interface AvailabilityInfo {
  branch: string;
  status: string;
  shelfmark?: string;
}

export interface SearchResult {
  title: string;
  availability: AvailabilityInfo[];
}

export async function searchVoebb(query: string): Promise<SearchResult[]> {
  // Headless false so we can watch it interact. Change to true for production/background speed.
  const browser = await chromium.launch({ headless: false, slowMo: 150 }); 
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }, 
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();

  try {
    console.log(`[voebbx] Launching voebb.de (Desktop View)...`);
    await page.goto('https://www.voebb.de/', { waitUntil: 'load' });

    // Handle initial cookie banner if present
    const cookieButton = page.locator('button:has-text("Akzeptieren"), button:has-text("Erlauben")').first();
    if (await cookieButton.isVisible()) {
      await cookieButton.click();
    }

    const searchInput = page.locator('input[type="search"], input[name="Query"], #search-input').first();
    await searchInput.waitFor({ timeout: 5000 });
    await searchInput.fill(query);

    console.log(`[voebbx] Submitting query...`);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'load', timeout: 15000 }).catch(() => {}),
      searchInput.press('Enter')
    ]);

    console.log(`[voebbx] App Matrix URL: ${page.url()}`);

    // Wait for the dynamic container to mount
    await page.waitForSelector('#container', { timeout: 15000 });
    console.log(`[voebbx] Hunting for physical book text matches inside container...`);

    const cleanQuery = query.replace(/["']/g, ''); 
    const dynamicTextSelector = `#container a:has-text("${cleanQuery}")`;
    const targetLinks = page.locator(dynamicTextSelector);
    const linksCount = await targetLinks.count();

    let targetLink = targetLinks.first();
    let titleText = '';
    let foundPhysicalBook = false;

    // Loop through the matched text links to find the first one that is NOT an e-medium
    for (let i = 0; i < linksCount; i++) {
      const currentLink = targetLinks.nth(i);
      
      // Look at the parent row structure to see if it lists "e-Medium", "Online", or "Download"
      const rowText = await currentLink.evaluate(el => el.closest('tr, li, .grid-row')?.textContent || '');
      
      if (!rowText.toLowerCase().includes('e-medium') && 
          !rowText.toLowerCase().includes('online-ressource') && 
          !rowText.toLowerCase().includes('download')) {
        
        targetLink = currentLink;
        foundPhysicalBook = true;
        console.log(`[voebbx] Filtered out e-media. Found a physical print entry at match index: ${i + 1}`);
        break;
      }
    }

    if (!foundPhysicalBook && linksCount > 0) {
      console.log(`[voebbx] Warning: Only digital matches detected. Attempting extraction on index 0.`);
    }

    if (!(await targetLink.isVisible())) {
      console.log(`[voebbx] No clean matching records found. Checking absolute first table link...`);
      const fallbackLink = page.locator('#container table tr td a').first();
      if (await fallbackLink.isVisible()) {
        const fallbackText = await fallbackLink.textContent();
        titleText = (fallbackText || 'Fallback Book Title').trim().replace(/[\n\t]+/g, ' ');
        await fallbackLink.click();
      } else {
        console.log('[voebbx] Core link matrix completely unrecognized.');
        await page.screenshot({ path: 'failure-state-desktop.png' });
        await browser.close();
        return [];
      }
    } else {
      const detectedTitle = await targetLink.textContent();
      titleText = (detectedTitle || query).trim().replace(/[\n\t]+/g, ' ');
      console.log(`[voebbx] Successfully isolated print anchor! Navigating into: "${titleText}"`);
      await targetLink.click();
    }

    // Give legacy architecture a brief buffer window to process session shift
    await page.waitForTimeout(1000);
    await page.waitForLoadState('networkidle');
    
    // Scrape dynamic nested table rows
    const availability = await parseAvailabilityTable(page);

    await browser.close();
    
    // Explicitly returns our fully scoped titleText string along with parsed array
    return [{ 
      title: titleText, 
      availability 
    }];

  } catch (error) {
    await page.screenshot({ path: 'error-screenshot.png' }).catch(() => {});
    await browser.close();
    console.error('[voebbx] Error:', error);
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

        console.log(`[voebbx] Live Asset Row ${i + 1} -> Branch: "${cleanBranch}", Status: "${cleanStatus}"`);

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
