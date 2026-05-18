import { searchVoebb } from './scraper.js';

async function main() {
  const query = process.argv[2] || 'Der Schwarm';
  
  console.log(`\n🔍 voebbx: Querying Berlin libraries for "${query}"...`);
  
  try {
    const results = await searchVoebb(query);
    
    if (!results || results.length === 0) {
      console.log('⚠️ No matches found for that query on VÖBB.');
      return;
    }

    const book = results[0];
    console.log(`\n📖 Title: ${book.title}`);
    console.log('─'.repeat(50));

    if (book.availability.length === 0) {
      console.log('❌ No physical branch availability data extracted.');
    } else {
      book.availability.forEach((loc) => {
        // Simple color mapping hints using text formatting
        const isAvailable = loc.status.toLowerCase().includes('verfügbar') || loc.status.toLowerCase().includes('ausleihbar');
        const statusIcon = isAvailable ? '🟢 [Available]' : '🔴 [Checked Out]';
        
        console.log(`📍 ${loc.branch}`);
        console.log(`   Status: ${statusIcon} ${loc.status}`);
        if (loc.shelfmark) console.log(`   Shelfmark: ${loc.shelfmark}`);
        console.log('─'.repeat(50));
      });
    }

  } catch (err) {
    console.error('\n❌ Fatal: Failed to negotiate with the aDIS/Web backend.');
  }
}

main();
