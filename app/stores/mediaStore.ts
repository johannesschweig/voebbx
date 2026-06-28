import { defineStore } from 'pinia';
import { useItemCacheStore } from './itemCacheStore';

export const useMediaStore = defineStore('media', {
  state: () => ({
    searchIds: [] as string[]
  }),

  actions: {
    async executeSearch(query: string) {
      this.searchIds = [];
      const itemCache = useItemCacheStore();
      
      const data: any = await $fetch('/api/search', { query: { q: query } });
      
      if (data.success) {
        // 1. Basis-Daten sofort in den zentralen Cache pushen
        data.results.forEach((item: any) => {
          itemCache.setBasicData({
            id: item.id,
            title: item.title,
            author: item.author || 'Unbekannter Autor',
            mediaType: item.mediaType || 'Buch'
          });
        });

        // 2. Im eigenen Store nur die IDs abspeichern
        this.searchIds = data.results.map((item: any) => item.id);
      }
    }

  }
});