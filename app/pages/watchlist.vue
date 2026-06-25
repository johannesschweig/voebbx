<script setup lang="ts">
import { onMounted } from 'vue'
import { useWatchlistStore } from '~/stores/watchlistStore'
import AvailabilityBadge from '~/components/AvailabilityBadge.vue'

const watchlistStore = useWatchlistStore()
const localZipInput = ref('')
const isSavingDb = ref(false)
const user = useSupabaseUser()
const supabase = useSupabaseClient()

onMounted(async () => {
  watchlistStore.fetchWatchlist()

  // 1. Beim Laden schauen, ob der User eine PLZ in den Supabase-Metadaten hat
  // console.log('Aktueller User:', user.value) // Debug-Ausgabe
  if (user.value?.user_metadata?.zip_code) {
    const savedZip = user.value.user_metadata.zip_code
    localZipInput.value = savedZip
    watchlistStore.updateLocation(savedZip) // Store füttern
  } else {
    // Fallback auf das Store-Default (10178)
    localZipInput.value = watchlistStore.userZip
  }
})

function handleSaveLocation() {
  const input = localZipInput.value.trim()
  if (!input) return

  // 1. Lokal im Store die Koordinaten austauschen (Sortierung triggert SOFORT)
  watchlistStore.updateLocation(input)

  // 2. Nur wenn der User eingeloggt ist, sichern wir es im Hintergrund in Supabase ab
  if (user.value) {
    supabase.auth.updateUser({
      data: { zip_code: input }
    }).catch(err => console.error('Fehler beim DB-Backup der PLZ:', err))
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <div
      class="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h3 class="font-bold text-gray-900 text-sm flex items-center gap-1.5">
          <span>📍</span> Dein Standort (PLZ)
        </h3>
        <p class="text-xs text-gray-500 mt-0.5">
          Aktueller Filter: <span class="font-bold text-blue-700">{{ watchlistStore.userZip }}</span>
        </p>
        <p class="text-xs text-gray-500 mt-0.5">
          Wir nutzen diese Information, um die Bibliotheken nach Entfernung zu sortieren.
        </p>
      </div>

      <div class="flex gap-2 self-start sm:self-auto">
        <input v-model="localZipInput" type="text" placeholder="z.B. 10559" @keyup.enter="handleSaveLocation"
          class="w-28 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-center font-bold定位 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
        <button @click="handleSaveLocation" :disabled="watchlistStore.isGeocoding || isSavingDb"
          class="rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-gray-800 transition-all disabled:opacity-50">
          {{ watchlistStore.isGeocoding || isSavingDb ? 'Lädt...' : 'Speichern' }}
        </button>
      </div>
    </div>


    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-black">Deine Merkliste</h1>
    </div>

    <div v-if="watchlistStore.loading" class="text-center py-8 text-gray-500">
      Lade Merkliste aus Supabase...
    </div>

    <div v-else-if="watchlistStore.items.length === 0"
      class="text-center py-12 border-2 border-dashed rounded-xl text-gray-400">
      Deine Merkliste ist noch leer.
    </div>

    <div v-else class="space-y-4">
      <NuxtLink v-for="item in watchlistStore.items" :key="item.media_id" :to="`/media/${item.media_id}`"
        class="p-4 bg-white border border-gray-100 shadow-sm rounded-xl flex flex-col gap-2 sm:flex-row justify-between sm:items-start">
        <div>
          <span class="text-xs font-semibold uppercase tracking-wider text-gray-400">{{ item.media_type || 'Buch'
          }}</span>
          <h3 class="font-bold text-lg text-gray-900 mt-0.5">{{ item.title }}</h3>
          <p class="text-sm text-gray-500">{{ item.author || 'Unbekannter Autor' }}</p>

          <AvailabilityBadge :media-id="item.media_id" />
        </div>

        <button
          @click="watchlistStore.toggleBookmark({ id: item.media_id, title: item.title, author: item.author || '', mediaType: item.media_type || '' })"
          class="self-start mt-2 sm:mt-0 text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-100 transition-colors">
          Entfernen
        </button>
      </NuxtLink>
    </div>
  </div>
</template>