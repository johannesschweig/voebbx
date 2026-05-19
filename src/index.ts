import { searchVoebb, SearchResult } from './scraper.js';
import { getSavedRecords, saveRecords } from './storage.js';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

/**
 * Renders a consistent formatted overview block for search item records.
 */
function displayBookRecords(records: SearchResult[]): void {
  records.forEach((book, index) => {
    console.log(` [Record #${index + 1}] 📖 Title: ${book.title}`);
    console.log(` 🔗 Permanent Link: ${book.url || 'N/A'}`);
    if (book.mediaType) console.log(` 📦 Media Type: ${book.mediaType}`);
    if (book.author)    console.log(` 👤 Author/Person: ${book.author}`);
    console.log('─'.repeat(60));

    if (book.availability.length === 0) {
      console.log(' ❌ No nearby physical branch availability data matched your criteria.');
    } else {
      book.availability.forEach((loc) => {
        const isAvailable = loc.status.toLowerCase().includes('verfügbar') || loc.status.toLowerCase().includes('ausleihbar');
        const statusIcon = isAvailable ? '🟢 [Available]' : '🔴 [Checked Out]';
        
        console.log(` 📍 ${loc.branch}`);
        console.log(`    Status: ${statusIcon} ${loc.status}`);
        if (loc.shelfmark) console.log(`    Shelfmark: ${loc.shelfmark}`);
      });
    }
    console.log('═'.repeat(60) + '\n');
  });
}

/**
 * Handles executing the scraping pipeline and prompts user selection rules afterwards.
 */
async function runSearchPipeline(query: string) {
  console.log(`\n🔍 voebbx: Querying Berlin libraries for physical print editions of "${query}"...`);
  
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
 * Main command router supporting directly running inline args or managing viewed collection vaults
 */
async function main() {
  const inlineArgument = process.argv[2];

  if (inlineArgument) {
    if (inlineArgument.trim().toLowerCase() === '--view-saved') {
      const saved = getSavedRecords();
      if (saved.length === 0) {
        console.log('\n🔖 Your saved library records collection vault is currently empty.');
      } else {
        console.log(`\n🔖 Displaying ${saved.length} Saved Records from local vault:\n`);
        displayBookRecords(saved);
      }
      rl.close();
      return;
    }

    await runSearchPipeline(inlineArgument.trim());
    return;
  }

  // Fallback interactive option sequence if zero arguments provided
  console.log('\n✨ VÖBBX CLI Options:');
  console.log(' [1] Run a completely new live search query');
  console.log(' [2] View previously saved individual records');
  
  const initialChoice = await askQuestion('\n👉 Select an option: ');
  
  if (initialChoice.trim() === '2') {
    const saved = getSavedRecords();
    if (saved.length === 0) {
      console.log('\n🔖 Your saved library records collection vault is currently empty.');
    } else {
      console.log(`\n🔖 Displaying ${saved.length} Saved Records from local vault:\n`);
      displayBookRecords(saved);
    }
    rl.close();
  } else {
    const newQuery = await askQuestion('✍️ Enter a book title to search: ');
    if (!newQuery.trim()) {
      console.log('Cancelled.');
      rl.close();
      return;
    }
    await runSearchPipeline(newQuery.trim());
  }
}

main();