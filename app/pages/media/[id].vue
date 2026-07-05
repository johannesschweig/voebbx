<!-- pages/media/[id].vue -->
<template>
  <div class="max-w-2xl mx-auto font-sans text-gray-800">
    <!-- Zurück-Button & Status -->
    <div class="mb-6 flex justify-between items-center">
      <NuxtLink @click="$router.back()" class="text-sm text-blue-600 hover:underline">← Zurück</NuxtLink>
      <BookmarkButton :mediaId="mediaId" :context="'detail'" />
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
          <div v-for="(item, index) in displayedBranches" :key="index"
            class="border rounded-lg p-4 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 class="font-medium text-gray-900">{{ item.branch }}</h3>
              <p v-if="item.shelfmark" class="text-xs text-gray-500 mt-0.5">
                Signatur: <span class="font-mono bg-gray-50 px-1 py-0.5 border rounded text-gray-700">{{ item.shelfmark
                  }}</span>
                  <!-- {{ item.daysToWait}} -->
              </p>
            </div>

            <!-- Status Badge -->
            <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold self-start sm:self-center"
              :class="getStatusClass(item.status)">
              {{
                item.daysToWait < 0 ? 'Rückgabe überfällig' :
                  item.daysToWait === 1 ? '⏳ 1 Tag' :
                    item.daysToWait > 1 && item.daysToWait !== 999 ? `⏳ ${item.daysToWait} Tage` :
                      item.status
              }}
            </span>
          </div>
          <button v-if="hiddenBranchesCount > 0" @click="showAllBranches = true"
            class="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
            {{ hiddenBranchesCount }} entferntere
            {{ hiddenBranchesCount === 1 ? 'Bibliothek' : 'Bibliotheken' }} anzeigen
          </button>
        </div>
      </section>

      <!-- VÖBB-Direktlink -->
      <footer class="mt-8 text-center">
        <a :href="getPermanentUrlFromId(data.data.id)" target="_blank"
          class="inline-block border border-1 border-blue-600 bg-white hover:bg-blue-100 text-blue-700 font-medium text-sm px-5 py-2.5 rounded-lg transition">
          Im VÖBB-Katalog öffnen ↗
        </a>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useItemCacheStore } from '@/stores/itemCacheStore'
import { getPermanentUrlFromId } from '../../../utils/index.ts'
import BookmarkButton from '~/components/BookmarkButton.vue'
import { sortBranchesByDistance } from '../../../utils/availability'
import { useUserStore } from '~/stores/userStore.js'
import { ref, computed } from 'vue'

const route = useRoute()
const mediaId = route.params.id
const itemCacheStore = useItemCacheStore()
const userStore = useUserStore()
const showAllBranches = ref(false)

// Das übernimmt jetzt komplett die Logik: 
// Gibt uns den Cache zurück oder fetcht automatisch!
const { data, pending, error } = useAsyncData(`detail-${mediaId}`, async () => {
  const details = await itemCacheStore.fetchDetails(mediaId)
  if (!details) throw new Error('Details konnten nicht geladen werden')
  return { success: true, data: details }
})

const displayedBranches = computed(() => {
  const branches = sortedBranches.value

  if (branches.length <= 3 || showAllBranches.value) {
    return branches
  }

  return branches.filter(item => {
    const dist = item.distance ?? 999
    return dist <= 7
  })
})

const hiddenBranchesCount = computed(() => {
  return sortedBranches.value.length - displayedBranches.value.length
})

const sortedBranches = computed(() => {
  if (!data.value?.success || !data.value?.data?.availability) {
    return []
  }

  return sortBranchesByDistance(data.value.data.availability, userStore.userCoords)
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