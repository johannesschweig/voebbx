<script setup lang="ts">
import { onMounted } from 'vue'
import { useWatchlistStore } from '~/stores/watchlistStore'
import { useItemCacheStore } from '~/stores/itemCacheStore'
import AvailabilityBadge from '~/components/AvailabilityBadge.vue'

const watchlistStore = useWatchlistStore()
const itemCacheStore = useItemCacheStore()
const isSavingDb = ref(false)
const user = useSupabaseUser()
const supabase = useSupabaseClient()

// 1. Initialisiere das Input-Feld direkt mit dem, was aktuell im Store steht (Default oder geladen)
const localZipInput = ref(watchlistStore.userZip)

// 2. Falls Supabase die PLZ im Hintergrund asynchron lädt, aktualisieren wir das Input-Feld automatisch
watch(() => watchlistStore.userZip, (newZip) => {
  localZipInput.value = newZip
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

    <div v-else-if="watchlistStore.watchlistIds.length === 0"
      class="text-center py-12 border-2 border-dashed rounded-xl text-gray-400">
      Deine Merkliste ist noch leer.
    </div>

    <div v-else class="space-y-4">
      <NuxtLink v-for="id in watchlistStore.watchlistIds" :key="id" :to="`/media/${id}`"
        class="p-4 bg-white border border-gray-100 shadow-sm rounded-xl flex flex-col gap-2 sm:flex-row justify-between sm:items-start">
        <div>
          <span class="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {{ itemCacheStore.items[id]?.mediaType || 'Buch' }}
          </span>
          <h3 class="font-bold text-lg text-gray-900 mt-0.5">
            {{ itemCacheStore.items[id]?.title || 'Lädt Titel...' }}
          </h3>
          <p class="text-sm text-gray-500">
            {{ itemCacheStore.items[id]?.author || 'Unbekannter Autor' }}
          </p>

          <AvailabilityBadge :media-id="id" />
        </div>

        <button @click.prevent="watchlistStore.toggleBookmark(itemCacheStore.items[id])"
          class="self-start mt-2 sm:mt-0 text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-100 transition-colors">
          Entfernen
        </button>
      </NuxtLink>
    </div>
  </div>
</template>