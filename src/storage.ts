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
    let updatedCount = 0;
    let addedCount = 0;

    for (const record of recordsToSave) {
      // Find if the record already exists by comparing URLs or matching titles
      const existingIndex = existingRecords.findIndex(r => 
        (r.url && r.url === record.url) || r.title.toLowerCase() === record.title.toLowerCase()
      );

      if (existingIndex !== -1) {
        existingRecords[existingIndex] = record; // Overwrite with fresh live data
        updatedCount++;
      } else {
        existingRecords.push(record); // Add as new record
        addedCount++;
      }
    }

    fs.writeFileSync(STORAGE_FILE, JSON.stringify(existingRecords, null, 2), 'utf8');
    console.log(`💾 Storage Updated: ${updatedCount} refreshed, ${addedCount} newly added.`);
  } catch (error: any) {
    console.error('⚠️ Failed to write records to storage:', error.message);
  }
}
/**
 * Deletes a specific record from storage by matching its title or URL.
 */
export function deleteRecord(record: SearchResult): void {
  try {
    const existingRecords = getSavedRecords();
    const filteredRecords = existingRecords.filter(r => 
      !((r.url && r.url === record.url) || r.title.toLowerCase() === record.title.toLowerCase())
    );

    if (existingRecords.length !== filteredRecords.length) {
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(filteredRecords, null, 2), 'utf8');
      console.log(`🗑️ Successfully deleted "${record.title}" from storage.`);
    } else {
      console.log(`⚠️ Record could not be found in storage.`);
    }
  } catch (error: any) {
    console.error('⚠️ Failed to delete record from storage:', error.message);
  }
}