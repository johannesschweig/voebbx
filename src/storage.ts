import * as fs from 'fs';
import * as path from 'path';
import { SearchResult } from './scraper.js';

const STORAGE_FILE = path.join(process.cwd(), 'saved_records.json');

/**
 * Retrieves all saved book records from local storage.
 */
export function getSavedRecords(): SearchResult[] {
  try {
    if (!fs.existsSync(STORAGE_FILE)) {
      return [];
    }
    const data = fs.readFileSync(STORAGE_FILE, 'utf8');
    return JSON.parse(data) || [];
  } catch (error: any) {
    console.error('⚠️ Could not read saved records:', error.message);
    return [];
  }
}

/**
 * Saves an array of book records to storage without duplicates (using URL/Title uniqueness).
 */
export function saveRecords(recordsToSave: SearchResult[]): void {
  try {
    const existingRecords = getSavedRecords();
    let savedCount = 0;

    for (const record of recordsToSave) {
      // Check duplicate against URL if present, otherwise fallback to title matching
      const isDuplicate = existingRecords.some(r => 
        (r.url && r.url === record.url) || r.title.toLowerCase() === record.title.toLowerCase()
      );

      if (!isDuplicate) {
        existingRecords.push(record);
        savedCount++;
      }
    }

    if (savedCount > 0) {
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(existingRecords, null, 2), 'utf8');
      console.log(`💾 Successfully saved ${savedCount} new record(s) to your list.`);
    } else {
      console.log(`ℹ️ All selected records were already saved previously.`);
    }
  } catch (error: any) {
    console.error('⚠️ Failed to write records to storage:', error.message);
  }
}