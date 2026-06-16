<script setup lang="ts">
import { onMounted } from 'vue'
import { useWatchlistStore } from '~/stores/watchlistStore'
import AvailabilityBadge from '~/components/AvailabilityBadge.vue'

const watchlistStore = useWatchlistStore()

onMounted(() => {
  watchlistStore.fetchWatchlist()
})
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
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