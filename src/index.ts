import { searchVoebb, SearchResult } from './scraper.js';
import { getSavedRecords, saveRecords, deleteRecord } from './storage.js';
import * as readline from 'readline';
import { LIBRARY_DISTANCES } from './distanceConfig.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

/**
 * Renders an overview block for item records, sorting by physical kilometer proximity 
 * and showing at most the top 3 nearest available branches.
 */
function displayBookRecords(records: SearchResult[]): void {
  records.forEach((book, index) => {
    console.log(` [Record #${index + 1}] 📖 Title: ${book.title}`);
    console.log(` 🔗 Permanent Link: ${book.url || 'N/A'}`);
    if (book.mediaType) console.log(` 📦 Media Type: ${book.mediaType}`);
    if (book.author)    console.log(` 👤 Author/Person: ${book.author}`);
    console.log('─'.repeat(60));

    // 1. Map ALL branches, attach distance, and calculate opportunity priority score
    const hybridSortedLocations = book.availability
      .map((loc) => {
        // 1a. Split by colon to remove the district prefix
        const parts = loc.branch.split(':');
        const rawBranchName = parts.length > 1 ? parts[1] : parts[0];

        // 1b. Clean out all spaces, tabs, and non-breaking spaces (\u00a0 / &nbsp;)
        const cleanScrapedName = rawBranchName.replace(/[\s\u00a0]+/g, ' ').trim();

        // 1c. Find the matched library inside your array structure
        const matchedLib = LIBRARY_DISTANCES.find(
          (lib) => lib.name.replace(/[\s\u00a0]+/g, ' ').trim().toLowerCase() === cleanScrapedName.toLowerCase()
        );

        const distance = matchedLib ? matchedLib.distanceKm : 99.0;

        // Check if this specific branch has the item available
        const statusLower = loc.status.toLowerCase();
        const isAvailable = statusLower.includes('verfügbar') || statusLower.includes('ausleihbar');

        // 1d. Calculate Priority Score based on the opportunity matrix tiers
        let priorityScore = 6; // Default fallback (far away & checked out)
        
        if (distance < 5) {
          priorityScore = isAvailable ? 1 : 2; // Under 5km: Available (1), Checked Out (2)
        } else if (distance <= 10) {
          priorityScore = isAvailable ? 3 : 4; // 5-10km: Available (3), Checked Out (4)
        } else {
          priorityScore = isAvailable ? 5 : 6; // Over 10km: Available (5), Checked Out (6)
        }

        return { ...loc, distanceKm: distance, isAvailable, priorityScore };
      })
      .sort((a, b) => {
        // Primary sort: Best opportunity tier score
        if (a.priorityScore !== b.priorityScore) {
          return a.priorityScore - b.priorityScore;
        }
        // Secondary sort: Absolute distance as tie-breaker within the same tier
        return a.distanceKm - b.distanceKm;
      });

    // 2. Track total available count purely for dynamic labels and summary strings
    const availableCount = hybridSortedLocations.filter(loc => loc.isAvailable).length;

    if (book.availability.length === 0) {
      console.log(' ❌ Error. Something is wrong.');
    } else {
      // Retained your explicit text choices here
      if (availableCount === 0) {
        console.log(' 📍 Nearest Branches:');
      } else {
        console.log(' 📍 Nearest Available Branches:');
      }

      // 3. Select the top 3 best mixed opportunities from our matrix
      const displayedLocations = hybridSortedLocations.slice(0, 3);

      displayedLocations.forEach((loc) => {
        const distanceLabel = loc.distanceKm === 99.0 ? 'unknown distance' : `${Math.round(loc.distanceKm)} km away`;
        const statusIcon = loc.isAvailable ? '🟢 [Available]' : '🔴 [Checked Out]';

        // Maintained your multi-line print layout
        console.log(`    ${statusIcon}`);
        console.log(`    ${loc.branch} (${distanceLabel})`);
        console.log(`       Status: ${loc.status}`);
        if (loc.shelfmark && loc.isAvailable) console.log(`       Shelfmark: ${loc.shelfmark}`);
      });

      // 4. Provide a clean summary if other options exist further down the list
      const hiddenCount = hybridSortedLocations.length - displayedLocations.length;
      if (hiddenCount > 0) {
        const branchTypeLabel = availableCount > 0 ? 'available branch(es)' : 'branch(es)';
        console.log(`    👉 (Plus ${hiddenCount} other ${branchTypeLabel} further away)`);
      }
    }
    console.log('═'.repeat(60) + '\n');
  });
}
/**
 * Handles executing the scraping pipeline and prompts user selection rules afterwards.
 */
async function runSearchPipeline(query: string) {
  console.log(`\n🔍 voebbx: Querying Berlin libraries for physical editions of "${query}"...`);

  try {
    const results = await searchVoebb(query);

    if (!results || results.length === 0) {
      console.log('⚠️ No print matches found for that query on VÖBB.');
      rl.close();
      return;
    }

    console.log(`\n📚 Found ${results.length} unique records. Parsing metadata and closest physical locations:\n`);
    displayBookRecords(results);

    // Dynamic extraction parser targeting multiple indices separated by spaces or commas
    const inputSelection = await askQuestion('❓ Which records do you want to save for later? (e.g. "1 2 4" or press Enter to skip): ');

    // Split on whitespace or commas, map integers, filter invalid outputs
    const selectedIndices = inputSelection
      .replace(/,/g, ' ')
      .split(/\s+/)
      .map(str => parseInt(str.trim(), 10))
      .filter(num => !isNaN(num) && num >= 1 && num <= results.length);

    if (selectedIndices.length > 0) {
      const recordsToSave = selectedIndices.map(idx => results[idx - 1]);
      saveRecords(recordsToSave);
    } else {
      console.log('ℹ️ No valid records were selected for storage.');
    }

  } catch (err) {
    console.error('\n❌ Fatal: Failed to negotiate with the aDIS/Web backend pipeline.');
  } {
    rl.close();
  }
}

/**
 * Displays saved records and automatically re-fetches all live statuses on command.
 */
async function handleSavedRecordsManagement() {
  const saved = getSavedRecords();
  if (saved.length === 0) {
    console.log('\n🔖 Your saved library records vault is currently empty.');
    rl.close();
    return;
  }

  console.log(`\n🔖 Displaying ${saved.length} Saved Records:\n`);
  displayBookRecords(saved);

  console.log('✨ Options:');
  console.log(' [R] Re-fetch/Refresh ALL saved records live');
  console.log(' [D] Delete a specific record'); // Added option
  console.log(' [Enter] Exit');

  const action = await askQuestion('\n👉 Choose an action: ');
  const cleanAction = action.trim().toLowerCase();

  if (cleanAction === 'r') {
    console.log(`\n🔄 Initiating live status refetch for ALL (${saved.length}) record(s)...`);

    for (const targetRecord of saved) {
      // 1. Extract ONLY the numeric ID following 'AK' or 'SAK' from the permanent URL
      const idMatch = targetRecord.url ? targetRecord.url.match(/(?:S?AK)(\d+)/i) : null;
      const uniqueId = idMatch ? idMatch[1] : null; // Contains only the digits (e.g. "35033692")

      if (!uniqueId) {
        console.log(`⚠️ Skip: No valid numeric system ID found in URL for "${targetRecord.title.substring(0, 30)}..."`);
        continue;
      }

      console.log(`\n📡 Re-polling via unique ID: [${uniqueId}] for "${targetRecord.title.substring(0, 30)}..."`);

      try {
        // 2. Query searchVoebb using the clean numeric ID
        const freshLiveResults = await searchVoebb(uniqueId);

        if (freshLiveResults && freshLiveResults.length > 0) {
          console.log(`\n🟢 Fresh data received for ID [${uniqueId}]:`);
          displayBookRecords([freshLiveResults[0]]);
          saveRecords([freshLiveResults[0]]);
        } else {
          console.log(`⚠️ Could not find live print records matching ID "${uniqueId}" right now.`);
        }
      } catch (err) {
        console.error(`❌ Failed to re-fetch live data for ID "${uniqueId}" (${targetRecord.title.substring(0, 20)}...)`);
      }
    }
    console.log('\n✅ All saved records have been successfully refreshed.');
  }
  // Added deletion execution block
  else if (cleanAction === 'd') {
    const selectToDelete = await askQuestion('❓ Enter the record number you want to delete: ');
    const idx = parseInt(selectToDelete.trim(), 10) - 1;

    if (!isNaN(idx) && saved[idx]) {
      deleteRecord(saved[idx]);
    } else {
      console.log('❌ Invalid record selection.');
    }
  }

  rl.close();
}
/**
 * Main command router supporting directly running inline args or managing viewed collection vaults
 */
async function main() {
  const inlineArgument = process.argv[2];

  if (inlineArgument) {
    if (inlineArgument.trim().toLowerCase() === '--view-saved') {
      await handleSavedRecordsManagement(); // Updated route
      return;
    }
    await runSearchPipeline(inlineArgument.trim());
    return;
  }

  console.log('\n✨ VÖBBX CLI Options:');
  console.log(' [1] Run a completely new live search query');
  console.log(' [2] View & Re-fetch/Refresh saved records'); // Updated text label

  const initialChoice = await askQuestion('\n👉 Select an option: ');

  if (initialChoice.trim() === '2') {
    await handleSavedRecordsManagement(); // Updated route
  } else {
    const newQuery = await askQuestion('✍️ Enter a title to search: ');
    if (!newQuery.trim()) {
      console.log('Cancelled.');
      rl.close();
      return;
    }
    await runSearchPipeline(newQuery.trim());
  }
}

main();
