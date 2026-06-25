import { defineStore } from 'pinia'
import berlinZips from '~/assets/berlinZipCodes.json'
import type { MediaItem } from './mediaStore'


function toMediaItem(row: any): MediaItem {
  return {
    id: row.media_id,
    title: row.title,
    author: row.author,
    mediaType: row.media_type,
    loadingDetails: false,
  }
}

export const useWatchlistStore = defineStore('watchlist', {
  state: () => ({
    items: [] as MediaItem[],
    loading: false,
    showAuthModal: false,
    userZip: '10178',
    userCoords: { lat: 52.5219, lon: 13.4132 },
    isGeocoding: false
  }),

  getters: {
    isBookmarked: (state) => (mediaId: string) => state.items.some(item => item.id === mediaId)
  },

  actions: {
    // Hilfsfunktion um die aktuelle User-ID zu bekommen
    async getUserId() {
      if (import.meta.server) return null
      const supabase = useSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      return session?.user?.id || null
    },

    // 1. Merkliste laden
    async fetchWatchlist() {
      if (import.meta.server || this.loading || this.items.length > 0) return

      this.loading = true

      const userId = await this.getUserId()
      if (!userId) {
        this.items = [] // Liste leeren wenn ausgeloggt
        return
      }

      const supabase = useSupabaseClient()

      const { data, error } = await supabase
        .from('voebbx_watchlist')
        .select('media_id, title, author, media_type, user_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        this.items = data.map(toMediaItem)
      }
      this.loading = false
    },

    // 2. Bookmark hinzufügen/entfernen mit Login-Prüfung
    async toggleBookmark(mediaItem: { id: string; title: string; author: string; mediaType: string }) {
      if (import.meta.server) return

      const userId = await this.getUserId()

      // 🔒 Falls nicht eingeloggt: Vorgang abbrechen und Modal öffnen!
      if (!userId) {
        this.showAuthModal = true
        return
      }

      const supabase = useSupabaseClient()
      const alreadySaved = this.isBookmarked(mediaItem.id)

      if (alreadySaved) {
        const { error } = await supabase
          .from('voebbx_watchlist')
          .delete()
          .eq('media_id', mediaItem.id)
          .eq('user_id', userId)

        if (!error) {
          this.items = this.items.filter(item => item.id !== mediaItem.id)
        }
      } else {
        const newItem: MediaItem = {
          id: mediaItem.id,
          title: mediaItem.title,
          author: mediaItem.author,
          mediaType: mediaItem.mediaType,
          loadingDetails: false
        }

        // insert with correct supabase table name and fields
        const { error } = await supabase
          .from('voebbx_watchlist')
          .insert([{
            media_id: mediaItem.id,
            title: mediaItem.title,
            author: mediaItem.author,
            media_type: mediaItem.mediaType,
            user_id: userId,
          }])

        if (!error) {
          this.items.unshift(newItem)
        }
      }
    },

    updateLocation(zipCode: string) {
      const cleanZip = zipCode.trim()
      if (!cleanZip) return

      // TypeScript-Sicherung für den JSON-Zugriff
      const lookup = berlinZips as Record<string, { lat: number; lon: number }>

      if (lookup[cleanZip]) {
        this.userZip = cleanZip
        this.userCoords = {
          lat: lookup[cleanZip].lat,
          lon: lookup[cleanZip].lon
        }
        console.log(`📍 Standort lokal aktualisiert auf PLZ ${cleanZip}:`, this.userCoords)
      } else {
        // Wenn der Nutzer z. B. Quatsch eintippt oder eine PLZ außerhalb Berlins
        alert('Diese Postleitzahl wurde in der Berliner Datenbank nicht gefunden. Nutze Standard-Mitte.')
      }
    },

    enrichMediaItem(id: string, scrapedData: { availability: AvailabilityInfo[], author?: string, mediaType?: string }) {
      const item = this.items.find(m => m.id === id);
      if (item) {
        item.availability = scrapedData.availability;
        if (scrapedData.author) item.author = scrapedData.author;
        if (scrapedData.mediaType) item.mediaType = scrapedData.mediaType;
      }
    }
  }
})