<!-- pages/index.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMediaStore } from '~/stores/mediaStore'
import EmptyState from '~/components/EmptyState.vue'
import Faq from '~/components/Faq.vue'
import MediaItem from '~/components/MediaItem.vue'

const { track } = useUmami()
const route = useRoute()
const router = useRouter()
const mediaStore = useMediaStore()
const searchQuery = ref('')
const loading = ref(false)
const hasSearched = ref(false)
const lastQuery = ref('')
const quickSearches = [
  { label: '📖 Dune', query: 'Dune Wüstenplanet' },
  { label: '🧩 Catan', query: 'Siedler von Catan' },
  { label: '🎧 Tonie Eiskönigin', query: 'Tonie Eiskönigin' }
]

// onMounted(() => {
//   if (route.query.q && typeof route.query.q === 'string') {
//     searchQuery.value = route.query.q
//     handleSearch(searchQuery.value, 'user')
//   }
// })

watch(
  () => route.query.q,
  (newQuery) => {
    if (!newQuery) {
      // Wenn kein 'q' in der URL (Navbar-Klick), alles auf Startzustand setzen
      searchQuery.value = ''
      lastQuery.value = ''
      hasSearched.value = false
      mediaStore.searchIds = []
    } else if (newQuery !== searchQuery.value) {
      // Falls via Browser-History (Zurück-Button) gesucht wird
      searchQuery.value = String(newQuery)
      handleSearch(searchQuery.value, 'user')
    }
  },
  { immediate: true } // Ersetzt das alte onMounted komplett beim ersten Laden
)

function handleInputClear() {
  if (searchQuery.value === '') {
    hasSearched.value = false
    mediaStore.searchIds = []
    router.replace({ query: {} }) // Entfernt das ?q= aus der URL
  }
}

function handleQuickSearch(query: string) {
  searchQuery.value = query
  handleSearch(query, 'quick')
}

async function handleSearch(queryText: string, source: 'user' | 'quick') {
  const cleanQuery = queryText.trim()
  if (!cleanQuery) return
  loading.value = true
  hasSearched.value = false
  lastQuery.value = cleanQuery
  router.replace({ query: { q: cleanQuery } })
    track(
      source === 'user' ? 'search-started' : 'search-quick',
      { query: cleanQuery }
    )
  try {
    await mediaStore.executeSearch(cleanQuery)
  } catch (error) {
    console.error('Fehler bei der VÖBB-Suche:', error)
  } finally {
    loading.value = false
    hasSearched.value = true
  }
}

</script>

<template>
  <div class="min-h-screen">
    <div class="max-w-2xl mx-auto md:py-12">

      <!-- Suchformular -->
      <div class="mb-10">
        <form @submit.prevent="handleSearch(searchQuery, 'user')" class="flex gap-2 mb-3">
          <input v-model="searchQuery" type="search" placeholder="Titel, Autor, Spiel …" @search="handleInputClear"
            @input="handleInputClear"
            class="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
            :disabled="loading" />
          <button type="submit" class="btn btn-md btn-accent" :disabled="loading || !searchQuery.trim()">
            {{ loading ? '…' : 'Suchen' }}
          </button>
        </form>

        <div v-if="mediaStore.searchIds.length === 0 && !loading"
          class="flex flex-wrap gap-2 items-center text-xs text-gray-500 px-1">
          <span class="mr-1 hidden sm:inline">Vorschläge:</span>

          <button v-for="item in quickSearches" :key="item.query" type="button" @click="handleQuickSearch(item.query)"
            :disabled="loading"
            class="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            {{ item.label }}
          </button>
        </div>
      </div>

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
          <MediaItem v-for="id in mediaStore.searchIds" :key="id" :mediaId="id" />
        </ul>
      </div>

      <!-- Leer-Zustand nach Suche -->
      <div v-else-if="hasSearched" class="text-center py-16 text-gray-400 text-sm">
        Keine Treffer für „{{ lastQuery }}" gefunden.
      </div>
      <div v-else class="flex flex-col gap-8">
        <EmptyState />
        <Faq />
      </div>


      <div class="text-center text-sm text-gray-400 mt-8">
        Feedback? Email an <a href="mailto:bibblitz@proton.me"
          class="text-blue-500 hover:text-blue-700">bibblitz@proton.me</a>
      </div>

      <div class="mt-12 flex gap-3 text-xs">
        <NuxtLink to="/imprint" class="text-gray-400 hover:text-gray-600">Impressum</NuxtLink>
        <NuxtLink to="/data-privacy" class="text-gray-400 hover:text-gray-600">Datenschutz</NuxtLink>
      </div>
    </div>
  </div>
</template>