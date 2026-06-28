<!-- pages/index.vue -->
<template>
  <div class="min-h-screen">
    <div class="max-w-2xl mx-auto px-4 py-12">

      <!-- Suchformular -->
      <form @submit.prevent="handleSearch" class="flex gap-2 mb-10">
        <input v-model="searchQuery" type="text" placeholder="Titel, Autor, Spiel …"
          class="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm placeholder:text-gray-400"
          :disabled="loading" />
        <button type="submit"
          class="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm"
          :disabled="loading || !searchQuery.trim()">
          {{ loading ? '…' : 'Suchen' }}
        </button>
      </form>

      <!-- Lade-Zustand -->
      <div v-if="loading" class="text-center py-16 text-gray-400 text-sm animate-pulse">
        Frage VÖBB-Katalog ab …
      </div>

      <!-- Ergebnisse -->
      <div v-else-if="mediaStore.searchIds.length > 0">
        <p class="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">
          {{ mediaStore.searchIds.length }} Treffer
        </p>
        <ul class="space-y-2">
          <li v-for="id in mediaStore.searchIds" :key="id"
            class="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all">
            <div class="flex items-center gap-3 p-4">

              <NuxtLink :to="`/media/${id}`" class="flex-1 min-w-0">
                <h3
                  class="font-semibold text-gray-900 text-sm leading-snug truncate group-hover:text-blue-600 transition-colors">
                  {{ itemCacheStore.items[id]?.title || 'Lädt Titel...' }}
                </h3>
                <p v-if="itemCacheStore.items[id]?.author" class="text-xs text-gray-400 mt-0.5 truncate">
                  {{ itemCacheStore.items[id]?.author }}
                </p>
                <div class="mt-2">
                  <AvailabilityBadge :mediaId="id" />
                </div>
              </NuxtLink>

              <button @click.stop="watchlistStore.toggleBookmark(itemCacheStore.items[id].id)"
                class="shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all"
                :class="watchlistStore.isBookmarked(id)
                  ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700'">
                <span>{{ watchlistStore.isBookmarked(id) ? '★' : '☆' }}</span>
                <span class="hidden sm:inline">{{ watchlistStore.isBookmarked(id) ? 'Gemerkt' : 'Merken' }}</span>
              </button>

            </div>
          </li>
        </ul>
      </div>

      <!-- Leer-Zustand nach Suche -->
      <div v-else-if="hasSearched" class="text-center py-16 text-gray-400 text-sm">
        Keine Treffer für „{{ lastQuery }}" gefunden.
      </div>
      <div v-else>
        <EmptyState />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMediaStore } from '~/stores/mediaStore'
import { useItemCacheStore } from '~/stores/itemCacheStore'
import { useWatchlistStore } from '~/stores/watchlistStore'
import AvailabilityBadge from '~/components/AvailabilityBadge.vue'
import EmptyState from '~/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const mediaStore = useMediaStore()
const watchlistStore = useWatchlistStore()
const itemCacheStore = useItemCacheStore()
const searchQuery = ref('')
const loading = ref(false)
const hasSearched = ref(false)
const lastQuery = ref('')

onMounted(() => {
  if (route.query.q && typeof route.query.q === 'string') {
    searchQuery.value = route.query.q
    handleSearch()
  }
  watchlistStore.fetchWatchlist()
})

async function handleSearch() {
  if (!searchQuery.value.trim()) return
  loading.value = true
  hasSearched.value = false
  lastQuery.value = searchQuery.value
  router.replace({ query: { q: searchQuery.value } })
  try {
    await mediaStore.executeSearch(searchQuery.value)
  } catch (error) {
    console.error('Fehler bei der VÖBB-Suche:', error)
  } finally {
    loading.value = false
    hasSearched.value = true
  }
}


</script>