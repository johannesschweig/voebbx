<!-- pages/media/[id].vue -->
<template>
  <div class="max-w-2xl mx-auto p-4 font-sans text-gray-800">
    <!-- Zurück-Button & Status -->
    <div class="mb-6">
      <NuxtLink @click="$router.back()" class="text-sm text-blue-600 hover:underline">← Zurück</NuxtLink>
    </div>

    <!-- Lade-Zustand -->
    <div v-if="pending" class="text-center py-12 text-gray-500 animate-pulse">
      <p class="text-lg font-semibold">Suche Medien-Details beim VÖBB...</p>
    </div>

    <!-- Fehler-Zustand -->
    <div v-else-if="error || !data?.success" class="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
      <p class="font-semibold">Fehler beim Laden der Daten</p>
      <p class="text-sm">{{ error?.message || data?.error }}</p>
    </div>

    <!-- Daten-Anzeige -->
    <div v-else-if="data?.data">
      <!-- Titel & Metadaten -->
      <header class="mb-6 border-b pb-6">
        <h1 class="text-2xl font-bold leading-tight text-gray-900 mb-2">
          {{ data.data.title }}
        </h1>
        <div class="flex flex-wrap gap-2 text-sm text-gray-600">
          <span v-if="data.data.author" class="bg-gray-100 px-2.5 py-1 rounded">✍️ {{ data.data.author }}</span>
          <span v-if="data.data.mediaType" class="bg-gray-100 px-2.5 py-1 rounded">📦 {{ data.data.mediaType }}</span>
        </div>
      </header>

      <!-- Verfügbarkeitsliste -->
      <section>
        <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
          📍 Standorte <span class="text-sm font-normal text-gray-500">(nach Entfernung sortiert)</span>
        </h2>

        <div v-if="data.data.availability.length === 0" class="text-gray-500 bg-gray-50 p-4 rounded text-center">
          Keine Exemplare an deinen konfigurierten Standorten gefunden.
        </div>

        <div v-else class="space-y-3">
          <div 
            v-for="(item, index) in data.data.availability" 
            :key="index"
            class="border rounded-lg p-4 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          >
            <div>
              <h3 class="font-medium text-gray-900">{{ item.branch }}</h3>
              <p v-if="item.shelfmark" class="text-xs text-gray-500 mt-0.5">
                Signatur: <span class="font-mono bg-gray-50 px-1 py-0.5 border rounded text-gray-700">{{ item.shelfmark }}</span>
              </p>
            </div>
            
            <!-- Status Badge -->
            <span 
              class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold self-start sm:self-center"
              :class="getStatusClass(item.status)"
            >
              {{ item.status }}
            </span>
          </div>
        </div>
      </section>

      <!-- VÖBB-Direktlink -->
      <footer class="mt-8 text-center">
        <a 
          :href="data.data.url" 
          target="_blank" 
          class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition"
        >
          Im VÖBB-Katalog öffnen ↗
        </a>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const mediaId = route.params.id

const { data, pending, error } = useFetch(`/api/detail`, {
  query: { id: mediaId }
})

function getStatusClass(status) {
  const s = status.toLowerCase()
  if (s.includes('verfügbar')) {
    return 'bg-green-100 text-green-800'
  }
  if (s.includes('ausgeliehen')) {
    return 'bg-amber-100 text-amber-800'
  }
  return 'bg-gray-100 text-gray-800'
}
</script>