import { searchVoebb } from './scraper.js';

async function main() {
  const query = process.argv[2] || 'Der Schwarm';
  
  console.log(`\n🔍 voebbx: Querying Berlin libraries for physical print editions of "${query}"...`);
  
  try {
    const results = await searchVoebb(query);
    
    if (!results || results.length === 0) {
      console.log('⚠️ No print matches found for that query on VÖBB.');
      return;
    }

    console.log(`\n📚 Found ${results.length} unique book records. Parsing closest physical locations:\n`);

    results.forEach((book, index) => {
      console.log(` [Record #${index + 1}] 📖 Title: ${book.title}`);
      console.log(` 🔗 Permanent Link: ${book.url || 'N/A'}`);
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

  } catch (err) {
    console.error('\n❌ Fatal: Failed to negotiate with the aDIS/Web backend pipeline.');
  }
}

main();