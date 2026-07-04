// utils/availability.ts
import libraryData from '~/assets/libraries.json'
import { calculateHaversineDistance } from './distance'
import type { AvailabilityInfo } from '../types/types'

// Interfaces
export interface StatusBadgeConfig {
  label: string;
  color: string;
}

/**
 * Private Hilfsfunktion: Bereinigt den gescrapten Bibliotheksnamen 
 * und sucht den passenden Eintrag in der libraries.json
 */
function findMatchingLibrary(branch: string) {
  const parts = branch.split(':')
  const rawBranchName = parts.length > 1 ? parts[1] : parts[0]

  const cleanScrapedName = (rawBranchName || '')
    .split(' - ')[0] // Schneidet Schließungshinweise ab
    .replace(/[\s\u00a0]+/g, ' ')
    .trim()
    .toLowerCase()

  return libraryData.find(lib => {
    const cleanConfigName = lib.name.replace(/[\s\u00a0]+/g, ' ').trim().toLowerCase()
    return cleanScrapedName.includes(cleanConfigName) || cleanConfigName.includes(cleanScrapedName)
  })
}

/**
 * Private Hilfsfunktion: Berechnet die verbleibenden Tage aus dem VÖBB-Status (Jahr: 2026)
 */
function calculateDaysToWait(status: string): number {
  const cleanStatus = status.toLowerCase().trim()

  // Fall 1: Sofort verfügbar
  if (
    cleanStatus.includes('verfügbar') || 
    cleanStatus.includes('am regal') || 
    cleanStatus.includes('ausleihbar')
  ) {
    return 0
  }

  // Fall 2: Konkretes Rückgabedatum geparst (z.B. "Fällig am: 14.08.2026" oder "Fällig am: 05.11.")
  const dateMatch = status.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})?/)
  if (dateMatch) {
    const day = parseInt(dateMatch[1], 10)
    const month = parseInt(dateMatch[2], 10) - 1 // JS-Monate sind 0-basiert
    const year = dateMatch[3] ? parseInt(dateMatch[3], 10) : 2026 // Fallback auf das aktuelle Jahr 2026

    const returnDate = new Date(year, month, day)
    const today = new Date()
    
    returnDate.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)

    const diffTime = returnDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays > 0 ? diffDays : 0
  }

  // Fall 3: Vorbestellt / Bestellt ohne konkretes Datum
  if (
    cleanStatus.includes('vorbestellt') || 
    cleanStatus.includes('entleihen') || 
    cleanStatus.includes('reserviert')
  ) {
    return 14 // Pauschaler Schätzwert
  }

  return 999 // Unbekannt / Verlust / Nicht im Regal
}

/**
 * Berechnet die Konfiguration des Status-Badges für die Übersichtkarten/Detailseiten
 */
export function calculateStatusInfo(
  availability: AvailabilityInfo[] | undefined, 
  userCoords: { lat: number; lon: number } | null | undefined
): StatusBadgeConfig {
  
  const sortedAvailability = sortBranchesByDistance(availability, userCoords )
  // 1. Ungültige/Verlorene Exemplare herausfiltern
  const validBranches = sortedAvailability?.filter(item => {
    const lower = item.status.toLowerCase()
    return !lower.includes('nicht im regal') && !lower.includes('verloren') && !lower.includes('vermisst')
  }) || []

  // Fallback: Keine gültigen Standorte übrig
  if (validBranches.length === 0) {
    return {
      label: '🔴 Nicht im Bestand',
      color: 'text-red-800 border-red-100'
    }
  }

  // 2. GOLDENE REGEL: Da das Array sortiert ist, ist der erste Eintrag IMMER unser Best-Match!
  const bestMatch = validBranches[0]

  // Distanz für diesen einen Best-Match berechnen
  const hasGeo = typeof bestMatch.lat === 'number' && typeof bestMatch.lon === 'number'
  const hasUser = userCoords && typeof userCoords.lat === 'number' && typeof userCoords.lon === 'number'
  
  const distance = (hasGeo && hasUser)
    ? calculateHaversineDistance(userCoords.lat, userCoords.lon, bestMatch.lat!, bestMatch.lon!)
    : 99.0

  // ==========================================
  // FALL A: Das Buch steht sofort im Regal (daysToWait === 0)
  // ==========================================
  if (bestMatch.daysToWait === 0) {
    if (distance < 3) {
      return {
        label: `🟢 Verfügbar in deiner Nähe`,
        color: 'text-emerald-800 bg-emerald-50 border-emerald-200'
      }
    } else {
      return {
        label: `🟢 Verfügbar (${Math.ceil(distance)} km entfernt)`,
        color: 'text-green-700 border-green-200'
      }
    }
  }

  // ==========================================
  // FALL B: Das Buch ist überall ausgeliehen (daysToWait > 0)
  // ==========================================
  if (distance <= 10) {
    const hasConcreteDate = /(\d{1,2})\.(\d{1,2})\.(\d{4})?/.test(bestMatch.status)
    
    return {
      label: (hasConcreteDate && bestMatch.daysToWait < 999) 
        ? `⏳ Ausgeliehen (${bestMatch.daysToWait} Tage)` 
        : '🟡 Aktuell ausgeliehen',
      color: 'text-yellow-800 border-yellow-300'
    }
  } else {
    return {
      label: '🟠 Schwer zu bekommen',
      color: 'text-orange-700 border-orange-200'
    }
  }
}

/**
 * Filtert ungültige Einträge, reichert mit Geo-Daten & berechneter Wartezeit an 
 * und sortiert die Bibliotheken nach JSON-Reihenfolge (Entfernung)
 */
export function filterAndEnrichBranches(rawAvailability: AvailabilityInfo[]): AvailabilityInfo[] {
  return rawAvailability
    .map(item => {
      const matchedLibrary = findMatchingLibrary(item.branch)
      const sortIndex = matchedLibrary ? libraryData.indexOf(matchedLibrary) : -1
      const daysToWait = calculateDaysToWait(item.status)

      return {
        ...item,
        lat: matchedLibrary?.lat,
        lon: matchedLibrary?.lon,
        daysToWait,
        sortIndex
      }
    })
    // Nur zuordenbare Bibliotheken behalten
    .filter(item => item.sortIndex !== -1)
    // Das temporäre Hilfsfeld 'sortIndex' löschen
    .map(({ sortIndex, ...cleanItem }) => cleanItem)
}

export function sortBranchesByDistance(availability: AvailabilityInfo[], userCoords: { lat: number; lon: number }): AvailabilityInfo[] {
  const mappedAvailability = availability.map(item => {
    const hasGeo = typeof item.lat === 'number' && typeof item.lon === 'number';
    
    const distance = calculateHaversineDistance(userCoords.lat, userCoords.lon, item.lat!, item.lon!)

    return {
      ...item,
      distance: distance !== undefined ? Math.round(distance * 10) / 10 : undefined
    };
  });

  return mappedAvailability.sort((a, b) => {
    const distA = a.distance ?? 999;
    const distB = b.distance ?? 999;

    return distA - distB; // Die kürzeste Distanz steht ganz oben
  });
}