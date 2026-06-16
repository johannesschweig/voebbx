import { LIBRARY_DISTANCES } from './distanceConfig'

export interface AvailabilityInfo {
  branch: string;
  status: string;
  shelfmark?: string;
}

export interface StatusBadgeConfig {
  label: string;
  color: string;
}

export function calculateStatusInfo(availability: AvailabilityInfo[] | undefined): StatusBadgeConfig {
  // Stufe 5: Gar keine Daten oder leere Tabelle -> Nicht im Bestand
  if (!availability || availability.length === 0) {
    return { 
      label: '🔴 Nicht im Bestand', 
      color: 'bg-red-50 text-red-700 border-red-200' 
    }
  }

  // Verarbeite alle Standorte, hänge die Distanz an und ermittle den Status
  const processedLocations = availability.map(loc => {
    const parts = loc.branch.split(':')
    const rawBranchName = parts.length > 1 ? parts[1] : parts[0]
    const cleanScrapedName = rawBranchName.replace(/[\s\u00a0]+/g, ' ').trim()

    const matchedLib = LIBRARY_DISTANCES.find(
      lib => lib.name.replace(/[\s\u00a0]+/g, ' ').trim().toLowerCase() === cleanScrapedName.toLowerCase()
    )
    
    const distance = matchedLib ? matchedLib.distanceKm : 99.0
    const statusLower = loc.status.toLowerCase()
    
    const isAvailable = (
      statusLower.includes('verfügbar') || 
      statusLower.includes('ausleihbar') || 
      statusLower.includes('am regal')
    ) && !statusLower.includes('verloren') && !statusLower.includes('nicht im regal') 

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
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold'
      }
    } else {
      // Stufe 2: Weiter weg verfügbar
      return {
        label: `🟢 Verfügbar (${Math.round(minDistance)} km entfernt)`,
        color: 'bg-green-50 text-green-700 border-green-200'
      }
    }
  }

  // FALL B: Existiert, aber überall ausgeliehen/verloren
  const minDistanceAnywhere = Math.min(...processedLocations.map(l => l.distance))

  if (minDistanceAnywhere <= 10) {
    // Stufe 3: Ausgeliehen, aber die Stammbibliothek wäre nah dran
    return {
      label: '🟡 Aktuell ausgeliehen',
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200'
    }
  } else {
    // Stufe 4: Nur weit weg gelistet und dort auch noch weg
    return {
      label: '🟠 Schwer zu bekommen (Weit weg / Belegt)',
      color: 'bg-orange-50 text-orange-700 border-orange-200'
    }
  }
}