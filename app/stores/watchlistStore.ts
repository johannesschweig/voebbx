import { defineStore } from 'pinia'
import { useItemCacheStore } from './itemCacheStore'
import berlinZips from '~/assets/berlinZipCodes.json'


export const useWatchlistStore = defineStore('watchlist', {
  state: () => ({
    watchlistIds: [] as string[],
    loading: false,
    showAuthModal: false,
    userZip: '10178',
    userCoords: { lat: 52.5219, lon: 13.4132 },
    isGeocoding: false
  }),

  getters: {
    isBookmarked: (state) => (mediaId: string) => state.watchlistIds.includes(mediaId)
  },

  actions: {
    // Hilfsfunktion um die aktuelle User-ID zu bekommen
    async getUserId() {
      if (import.meta.server) return null
      const supabase = useSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      return session?.user?.id || null
    },

    async fetchWatchlist() {
      if (import.meta.server || this.loading || this.watchlistIds.length > 0) return
      this.loading = true
      const itemCache = useItemCacheStore()

      const userId = await this.getUserId()
      if (!userId) { this.loading = false; return }

      const supabase = useSupabaseClient()
      const { data, error } = await supabase
        .from('voebbx_watchlist')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        // 1. Daten in den globalen Cache einspeisen
        data.forEach((row: any) => {
          itemCache.setBasicData({
            id: row.media_id,
            title: row.title,
            author: row.author,
            mediaType: row.media_type
          })
        })
        // 2. Nur IDs im State halten
        this.watchlistIds = data.map((row: any) => row.media_id)
      }
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
      if (!cachedItem) return // Sicherheitsnetz

      const userId = await this.getUserId()
      if (!userId) { this.showAuthModal = true; return }

      if (this.watchlistIds.includes(mediaId)) return

      console.log('Adding to watchlist:', mediaId)

      const supabase = useSupabaseClient()
      const { error } = await supabase
        .from('voebbx_watchlist')
        .insert([{
          media_id: cachedItem.id,
          title: cachedItem.title,
          author: cachedItem.author,
          media_type: cachedItem.mediaType,
          user_id: userId
        }])

      if (!error) {
        this.watchlistIds.unshift(mediaId)
      }
    },

    async removeFromWatchlist(mediaId: string) {
      const userId = await this.getUserId()
      if (!userId) return

      const supabase = useSupabaseClient()
      const { error } = await supabase
        .from('voebbx_watchlist')
        .delete()
        .eq('media_id', mediaId)
        .eq('user_id', userId)

      if (!error) {
        this.watchlistIds = this.watchlistIds.filter(id => id !== mediaId)
        console.log('Removing from watchlist:', mediaId)
      }
    },

    updateLocation(zipCode: string) {
      const cleanZip = zipCode.trim()
      if (!cleanZip) return
      const lookup = berlinZips as Record<string, { lat: number; lon: number }>

      if (lookup[cleanZip]) {
        this.userZip = cleanZip
        this.userCoords = { lat: lookup[cleanZip].lat, lon: lookup[cleanZip].lon }
      }
    }
  }
})