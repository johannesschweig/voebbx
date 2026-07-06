<!-- pages/index.vue -->
<template>
  <div class="min-h-screen">
    <div class="max-w-2xl mx-auto md:py-12">

      <!-- Suchformular -->
      <form @submit.prevent="handleSearch" class="flex gap-2 mb-10">
        <input v-model="searchQuery" type="text" placeholder="Titel, Autor, Spiel …"
          class="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
          :disabled="loading" />
        <button type="submit" class="btn btn-md btn-accent" :disabled="loading || !searchQuery.trim()">
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

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMediaStore } from '~/stores/mediaStore'
import EmptyState from '~/components/EmptyState.vue'
import Faq from '~/components/Faq.vue'
import MediaItem from '~/components/MediaItem.vue'

const route = useRoute()
const router = useRouter()
const mediaStore = useMediaStore()
const searchQuery = ref('')
const loading = ref(false)
const hasSearched = ref(false)
const lastQuery = ref('')

onMounted(() => {
  if (route.query.q && typeof route.query.q === 'string') {
    searchQuery.value = route.query.q
    handleSearch()
  }
})

async function handleSearch() {
  if (!searchQuery.value.trim()) return
  loading.value = true
  hasSearched.value = false
  lastQuery.value = searchQuery.value
  router.replace({ query: { q: searchQuery.value } })
    ; (window as any).umami?.track('search-started', { query: searchQuery.value })
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