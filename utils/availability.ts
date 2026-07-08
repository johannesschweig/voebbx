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
    return -999
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

    return diffDays
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
  userCoords: { lat: number; lon: number } | null | undefined,
  userZipDefault: boolean
): StatusBadgeConfig {

  const sortedAvailability = sortBranchesByDistance(availability, userCoords)
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

  // const closeAndAvailable = validBranches.filter(item => (item.distance || 99) < 3 ).filter(item => item.daysToWait === -999)
  if (userZipDefault) {
    const avail = validBranches.filter(item => item.daysToWait === -999).length
    if (avail > 0) {
      return {
        label: avail === 1 ? '🟢 Verfügbar' : `🟢 Verfügbar (${avail}x) `,
        color: 'text-green-700 border-green-200'
      }
    } else {
      return {
        label: '🟡 Aktuell ausgeliehen',
        color: 'text-yellow-800 border-yellow-300'
      }
    }
  } else {
    // Hilfsfunktion für sichere Distanzen
    const getDist = (b: any) => b.distance ?? 99

    // 1. Daten vorab sauber filtern
    const available = validBranches.filter(b => b.daysToWait === -999)
    const borrowed = validBranches.filter(b => (b.daysToWait || 999) > 0 && b.daysToWait !== 999)

    // -------------------------------------------------------------
    // PRIO 1: Verfügbar & Nah (< 3 km)
    // -------------------------------------------------------------
    const closeAvailable = available.filter(b => getDist(b) < 3)
    if (closeAvailable.length > 0) {
      return {
        label: closeAvailable.length === 1
          ? '🟢 Verfügbar in deiner Nähe'
          : `🟢 Verfügbar in deiner Nähe (${closeAvailable.length}x)`,
        color: 'text-emerald-800 bg-emerald-50 border-emerald-200'
      }
    }

    // -------------------------------------------------------------
    // PRIO 2: Verfügbar & Weiter weg (3 bis < 7 km)
    // -------------------------------------------------------------
    const farAvailable = available.filter(b => getDist(b) >= 3 && getDist(b) < 7)
    if (farAvailable.length > 0) {
      const closestDistance = Math.ceil(Math.min(...farAvailable.map(getDist)))
      return {
        label: farAvailable.length === 1
          ? `🟢 Verfügbar (${closestDistance} km)`
          : `🟢 Verfügbar (${closestDistance} km, ${farAvailable.length}x)`,
        color: 'text-emerald-700 border-emerald-200'
      }
    }

    // -------------------------------------------------------------
    // PRIO 3: Ausgeliehen & Nah (< 3 km)
    // -------------------------------------------------------------
    const closeBorrowed = borrowed.filter(b => getDist(b) < 3)
    if (closeBorrowed.length > 0) {
      const minDays = Math.min(...closeBorrowed.map(b => b.daysToWait || 999))
      return {
        label: `⏳ Ausgeliehen (${minDays} Tage)`,
        color: 'text-yellow-800 border-yellow-300'
      }
    }

    // -------------------------------------------------------------
    // PRIO 4: Ausgeliehen & Weiter weg (3 bis < 7 km)
    // -------------------------------------------------------------
    const farBorrowed = borrowed.filter(b => getDist(b) >= 3 && getDist(b) < 7)
    if (farBorrowed.length > 0) {
      const minDays = Math.min(...farBorrowed.map(b => b.daysToWait || 999))
      return {
        label: `⏳ Ausgeliehen (${minDays} Tage)`,
        color: 'text-yellow-800 border-yellow-300'
      }
    }

    // -------------------------------------------------------------
    // FALLBACK: Wenn gar nichts matcht (oder alles über 7km weg ist)
    // -------------------------------------------------------------
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