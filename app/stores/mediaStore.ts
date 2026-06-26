import { defineStore } from 'pinia';
import type { MediaItem, AvailabilityInfo } from '../../utils/types';

export const useMediaStore = defineStore('media', {
  state: () => ({
    searchResults: [] as MediaItem[]
  }),

  actions: {
    async executeSearch(query: string) {
      // Alten Such-State leeren
      this.searchResults = [];
      
      const data: any = await $fetch('/api/search', { query: { q: query } });
      
      if (data.success) {
        // Basis-Resultate direkt als flaches Array speichern
        this.searchResults = data.results.map((item: any) => ({
          ...item,
          loadingDetails: false,
          availability: undefined
        }));
      }
    },

    // Wird vom Badge aufgerufen, um genau das eine Objekt im Array anzureichern
    enrichMediaItem(id: string, scrapedData: { availability: AvailabilityInfo[], author?: string, mediaType?: string }) {
      const item = this.searchResults.find(m => m.id === id);
      if (item) {
        item.availability = scrapedData.availability;
        if (scrapedData.author) item.author = scrapedData.author;
        if (scrapedData.mediaType) item.mediaType = scrapedData.mediaType;
      }
    }
  }
});