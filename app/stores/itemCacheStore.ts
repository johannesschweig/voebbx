// stores/itemCacheStore.ts
import { defineStore } from 'pinia';
import type { MediaItem } from '../../types/types';

export const useItemCacheStore = defineStore('itemCache', {
  state: () => ({
    // Ein Dictionary/Record, das Medien anhand ihrer ID speichert
    items: {} as Record<string, MediaItem>,
    // Verhindert, dass dieselbe ID mehrfach gleichzeitig gefetcht wird (Race Conditions)
    fetching: {} as Record<string, Promise<any> | null>
  }),

  actions: {
    // Optional: Basis-Daten aus der Suche/Watchlist vorab eintragen
    setBasicData(item: MediaItem) {
      if (!this.items[item.id]) {
        this.items[item.id] = { ...item };
      }
    },

    // Holt die Details, falls sie nicht schon gecacht sind
    async fetchDetails(id: string) {
      // 1. Haben wir die Verfügbarkeit schon im Cache? -> Direkt zurückgeben
      if (this.items[id]?.availability) {
        return this.items[id];
      }

      // 2. Läuft gerade schon ein Fetch für diese ID? -> Darauf warten
      if (this.fetching[id]) {
        await this.fetching[id];
        return this.items[id];
      }

      // 3. Cache-Miss: Daten via API holen
      this.fetching[id] = $fetch('/api/detail', { query: { id } })
        .then((response: any) => {
          if (response.success && response.data) {
            // Daten im Cache zusammenführen (Merge)
            this.items[id] = { ...this.items[id], ...response.data };
          }
        })
        .finally(() => {
          this.fetching[id] = null; // Fetching-Status zurücksetzen
        });

      await this.fetching[id];
      return this.items[id];
    }
  }
});