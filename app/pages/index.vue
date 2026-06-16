<!-- pages/index.vue -->
<template>
  <div class="max-w-2xl mx-auto p-4 font-sans text-gray-800">
    <header class="text-center my-12">
      <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
        📚 VÖBB<span class="text-blue-600">x</span>
      </h1>
      <p class="text-gray-500 text-sm">Finde Medien in deiner Nähe – schnell und ohne Overhead.</p>
    </header>

    <!-- Suchformular -->
    <form @submit.prevent="handleSearch" class="flex gap-2 mb-8">
      <input v-model="searchQuery" type="text" placeholder="Titel, Autor oder Spiel suchen..."
        class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
        :disabled="loading" />
      <button type="submit"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition shadow-sm disabled:bg-blue-400"
        :disabled="loading || !searchQuery.trim()">
        {{ loading ? 'Sucht...' : 'Suchen' }}
      </button>
    </form>

    <!-- Lade-Zustand -->
    <div v-if="loading" class="text-center py-12 text-gray-500 animate-pulse">
      <p class="text-lg">Frage VÖBB-Katalog ab...</p>
    </div>

    <!-- Ergebnisse aus dem Pinia Store -->
    <div v-else-if="mediaStore.searchResults.length > 0" class="space-y-4">
      <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Suchergebnisse</h2>

      <div v-for="item in mediaStore.searchResults" :key="item.id"
        class="border rounded-lg p-4 bg-white shadow-sm hover:border-blue-400 transition cursor-pointer"
        @click="goToMedia(item.id)">
        <div class="flex justify-between items-start gap-2">
          <div>
            <h3 class="font-bold text-gray-900 hover:text-blue-600 transition">{{ item.title }}</h3>
            <p class="text-xs text-gray-400 mt-0.5" v-if="item.author">{{ item.author }}</p>
            
            <!-- Das Lazy-Badge triggert den Scraper im Hintergrund -->
            <AvailabilityBadge :mediaId="item.id" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMediaStore } from '~/stores/mediaStore'
import AvailabilityBadge from '~/components/AvailabilityBadge.vue'

const route = useRoute()
const router = useRouter()
const mediaStore = useMediaStore()

const searchQuery = ref('')
const loading = ref(false)

onMounted(() => {
  if (route.query.q && typeof route.query.q === 'string') {
    searchQuery.value = route.query.q
    handleSearch()
  }
})

async function handleSearch() {
  if (!searchQuery.value.trim()) return

  loading.value = true
  
  // URL-Parameter aktualisieren, ohne die Seite neu zu laden
  router.replace({ query: { q: searchQuery.value } })

  try {
    const mediaStore = useMediaStore()
    await mediaStore.executeSearch(searchQuery.value)
  } catch (error) {
    console.error('Fehler bei der VÖBB-Suche:', error)
  } finally {
    loading.value = false
  }
}

function goToMedia(id: string) {
  router.push(`/media/${id}`)
}
</script>