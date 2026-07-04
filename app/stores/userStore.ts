import { defineStore } from 'pinia'
import { useItemCacheStore } from './itemCacheStore'
import berlinZips from '~/assets/berlinZipCodes.json'

const LOCAL_WATCHLIST_KEY = 'bibblitz_watchlist'
const LOCAL_ZIP_KEY = 'bibblitz_zip'

function loadFromLocalStorage(): string[] {
  if (!import.meta.client) return []
  try {
    return JSON.parse(localStorage.getItem(LOCAL_WATCHLIST_KEY) || '[]')
  } catch {
    return []
  }
}

function saveToLocalStorage(ids: string[]) {
  if (!import.meta.client) return
  localStorage.setItem(LOCAL_WATCHLIST_KEY, JSON.stringify(ids))
}

export const useUserStore = defineStore('user', {
  state: () => ({
    watchlistIds: [] as string[],
    loading: false,
    userZip: (import.meta.client ? localStorage.getItem(LOCAL_ZIP_KEY) : null) || '10178',
    userCoords: { lat: 52.5219, lon: 13.4132 },
    isGeocoding: false
  }),
  getters: {
    isBookmarked: (state) => (mediaId: string) => state.watchlistIds.includes(mediaId)
  },
  actions: {
    async getUserId() {
      if (import.meta.server) return null
      const supabase = useSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      return session?.user?.id || null
    },

    async fetchUserData() {
      if (import.meta.server || this.loading || this.watchlistIds.length > 0) return
      this.loading = true
      const itemCache = useItemCacheStore()
      const userId = await this.getUserId()

      if (!userId) {
        // Nicht eingeloggt → aus localStorage
        this.watchlistIds = loadFromLocalStorage()
        const savedZip = localStorage.getItem(LOCAL_ZIP_KEY)
        if (savedZip) this.saveLocation(savedZip)
        this.loading = false
        return
      }

      // Eingeloggt → aus Supabase
      const supabase = useSupabaseClient()
      const { data, error } = await supabase
        .from('voebbx_watchlist')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        data.forEach((row: any) => {
          itemCache.setBasicData({
            id: row.media_id,
            title: row.title,
            author: row.author,
            mediaType: row.media_type
          })
        })
        this.watchlistIds = data.map((row: any) => row.media_id)
      }

      // ZIP aus Supabase user_metadata
      const { data: { session } } = await supabase.auth.getSession()
      const zip = session?.user?.user_metadata?.zip_code
      if (zip) this.saveLocation(zip)

      this.loading = false
    },

    async toggleBookmark(mediaId: string) {
      if (this.isBookmarked(mediaId)) {
        await this.removeFromWatchlist(mediaId)
      } else {
        await this.addToWatchlist(mediaId)
      }
    },

    async addToWatchlist(mediaId: string) {
      const itemCache = useItemCacheStore()
      const cachedItem = itemCache.items[mediaId]
      if (!cachedItem || this.watchlistIds.includes(mediaId)) return

      // Optimistisch in den State
      this.watchlistIds.unshift(mediaId)

      const userId = await this.getUserId()

      if (!userId) {
        // Nicht eingeloggt → nur localStorage
        saveToLocalStorage(this.watchlistIds)
        return
      }

      // Eingeloggt → nur Supabase
      const supabase = useSupabaseClient() as any
      const { error } = await supabase
        .from('voebbx_watchlist')
        .insert([{
          media_id: cachedItem.id,
          title: cachedItem.title,
          author: cachedItem.author,
          media_type: cachedItem.mediaType,
          user_id: userId
        }])

      if (error) {
        this.watchlistIds = this.watchlistIds.filter(id => id !== mediaId)
      }
    },

    async removeFromWatchlist(mediaId: string) {
      // Optimistisch entfernen
      this.watchlistIds = this.watchlistIds.filter(id => id !== mediaId)

      const userId = await this.getUserId()

      if (!userId) {
        // Nicht eingeloggt → nur localStorage
        saveToLocalStorage(this.watchlistIds)
        return
      }

      // Eingeloggt → nur Supabase
      const supabase = useSupabaseClient()
      const { error } = await supabase
        .from('voebbx_watchlist')
        .delete()
        .eq('media_id', mediaId)
        .eq('user_id', userId)

      if (error) {
        this.watchlistIds.unshift(mediaId)
      }
    },

    async saveLocation(zipCode: string) {
      const cleanZip = zipCode.trim()
      if (!cleanZip) return

      const lookup = berlinZips as Record<string, { lat: number; lon: number }>
      if (!lookup[cleanZip]) return

      this.userZip = cleanZip
      this.userCoords = { lat: lookup[cleanZip].lat, lon: lookup[cleanZip].lon }

      if (!import.meta.client) return
      const supabase = useSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        supabase.auth.updateUser({ data: { zip_code: cleanZip } })
          .catch(err => console.error('Fehler beim Speichern der PLZ:', err))
      } else {
        localStorage.setItem(LOCAL_ZIP_KEY, cleanZip)
      }
    },
  }
})