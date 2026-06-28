// utils/branchSorter.ts
import type { AvailabilityInfo } from '../types/types';
import libraryData from '~/assets/libraries.json'

export function filterAndSortBranches(rawAvailability: AvailabilityInfo[]): AvailabilityInfo[] {
  return rawAvailability
    .map(item => {
      // 1. Bezirks-Präfix vor dem Doppelpunkt entfernen (z.B. "Mitte:")[cite: 1]
      const parts = item.branch.split(':');
      const rawBranchName = parts.length > 1 ? parts[1] : parts[0];

      // 2. Unsichtbare Whitespaces und Schließungs-Hinweise (" - ist zurzeit geschlossen") bereinigen
      const cleanScrapedName = rawBranchName
        .split(' - ')[0] // Schneidet "ist zurzeit geschlossen" ab
        .replace(/[\s\u00a0]+/g, ' ')
        .trim()
        .toLowerCase();

      // 3. Match in libraryData suchen[cite: 1]
      const matchedIndex = libraryData.findIndex(lib => {
        const cleanConfigName = lib.name.replace(/[\s\u00a0]+/g, ' ').trim().toLowerCase();
        return cleanScrapedName.includes(cleanConfigName) || cleanConfigName.includes(cleanScrapedName);
      });

      return { ...item, sortIndex: matchedIndex };
    })
    .filter(item => item.sortIndex !== -1) // Nur bekannte Bibliotheken behalten[cite: 1]
    .sort((a, b) => a.sortIndex - b.sortIndex) // Nach Entfernung sortieren[cite: 1]
    .map(({ sortIndex, ...cleanItem }) => cleanItem); // sortIndex entfernen[cite: 1]
}