import { defineStore } from 'pinia'

export interface WatchlistItem {
  media_id: string;
  title: string;
  author?: string;
  media_type?: string;
  user_id: string;
}

export const useWatchlistStore = defineStore('watchlist', {
  state: () => ({
    items: [] as WatchlistItem[],
    loading: false,
    showAuthModal: false // 🟢 Zentraler Schalter für das Login-Modal
  }),

  getters: {
    isBookmarked: (state) => (mediaId: string) => state.items.some(item => item.media_id === mediaId)
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
      if (import.meta.server) return
      
      const userId = await this.getUserId()
      if (!userId) {
        this.items = [] // Liste leeren wenn ausgeloggt
        return
      }
      
      const supabase = useSupabaseClient()
      this.loading = true
      
      const { data, error } = await supabase
        .from('voebbx_watchlist')
        .select('media_id, title, author, media_type, user_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        this.items = data
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
          this.items = this.items.filter(item => item.media_id !== mediaItem.id)
        }
      } else {
        const newItem: WatchlistItem = {
          media_id: mediaItem.id,
          title: mediaItem.title,
          author: mediaItem.author,
          media_type: mediaItem.mediaType,
          user_id: userId
        }

        const { error } = await supabase
          .from('voebbx_watchlist')
          .insert([newItem])

        if (!error) {
          this.items.unshift(newItem)
        }
      }
    }
  }
})