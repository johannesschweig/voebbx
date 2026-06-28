import libraryData from '~/assets/libraries.json'
import { calculateHaversineDistance } from './distance'

export interface AvailabilityInfo {
  branch: string;
  status: string;
  shelfmark?: string;
}

export interface StatusBadgeConfig {
  label: string;
  color: string;
}

export function calculateStatusInfo(availability: AvailabilityInfo[] | undefined, userCoords: { lat: number; lon: number }): StatusBadgeConfig {
  // filter out media that are lost or not on shelf
  availability = availability?.filter(item => !item.status.toLowerCase().includes('nicht im regal') && !item.status.toLowerCase().includes('verloren'))
  if (!availability || availability.length === 0) {
    return {
      label: '🔴 Nicht im Bestand',
      color: 'text-red-800 border-red-100'
    }
  }

  // Verarbeite alle Standorte, hänge die Distanz an und ermittle den Status
  const processedLocations = availability.map(loc => {
    const parts = loc.branch.split(':')
    const rawBranchName = parts.length > 1 ? parts[1] : parts[0]
    const cleanScrapedName = rawBranchName.replace(/[\s\u00a0]+/g, ' ').trim()

    const matchedLib = libraryData.find(
      lib => lib.name.replace(/[\s\u00a0]+/g, ' ').trim().toLowerCase() === cleanScrapedName.toLowerCase()
    )

    const distance = matchedLib
      ? calculateHaversineDistance(userCoords.lat, userCoords.lon, matchedLib.lat, matchedLib.lon)
      : 99.0
    const statusLower = loc.status.toLowerCase()

    const isAvailable = (
      statusLower.includes('verfügbar') ||
      statusLower.includes('ausleihbar') ||
      statusLower.includes('am regal')
    )

    return { distance, isAvailable }
  })

  const availableLocations = processedLocations.filter(loc => loc.isAvailable)

  // FALL A: Mindestens ein verfügbares Exemplar
  if (availableLocations.length > 0) {
    const minDistance = Math.min(...availableLocations.map(l => l.distance))

    if (minDistance < 5) {
      // Stufe 1: In deiner Nähe verfügbar
      return {
        label: `🟢 Verfügbar in deiner Nähe (< ${Math.round(minDistance)} km)`,
        color: 'text-emerald-800 bg-emerald-50 border-emerald-200'
      }
    } else {
      // Stufe 2: Weiter weg verfügbar
      return {
        label: `🟢 Verfügbar (${Math.round(minDistance)} km entfernt)`,
        color: 'text-green-700 border-green-200'
      }
    }
  }

  // FALL B: Existiert, aber überall ausgeliehen/verloren
  const minDistanceAnywhere = Math.min(...processedLocations.map(l => l.distance))

  if (minDistanceAnywhere <= 10) {
    // Stufe 3: Ausgeliehen, aber die Stammbibliothek wäre nah dran
    const days = getDaysFromStatusString(availability[0].status)
    return {
      label: days ? `🟡 Ausgeliehen (${days} Tage)` : '🟡 Aktuell ausgeliehen',
      color: 'text-yellow-800 border-yellow-300'
    }
  } else {
    // Stufe 4: Nur weit weg gelistet und dort auch noch weg
    return {
      label: '🟠 Schwer zu bekommen',
      color: 'text-orange-700 border-orange-200'
    }
  }
}

function getDaysFromStatusString(statusString: string): number | null {
  // 1. Regex fängt Tag, Monat und Jahr getrennt ab
  // Ausgeliehen - Fällig am: 1.7.2026
  if (statusString.includes('Reserviert')) return null
  const dateMatch = statusString.match(/Fällig am:\s+(\d{1,2})\.(\d{1,2})\.(\d{4})/i);

  if (!dateMatch) {
    console.warn("Kein fälliges Datum im Status-String gefunden:", statusString);
    return null;
  }

  // 2. String-Teile extrahieren und parsen
  const day = parseInt(dateMatch[1], 10);
  const month = parseInt(dateMatch[2], 10) - 1; // ⚠️ Wichtig: Monate sind im JS-Date-Objekt 0-basiert
  const year = parseInt(dateMatch[3], 10);

  // 3. Gültiges JavaScript-Datum erzeugen
  const dueDay = new Date(year, month, day);
  const today = new Date();

  // 4. Differenz berechnen und in Tage umrechnen
  const differenceInMs = dueDay.getTime() - today.getTime();
  return Math.round(differenceInMs / (1000 * 60 * 60 * 24)) + 1;
}