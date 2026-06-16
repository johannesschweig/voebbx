<script setup>
import { computed } from 'vue'
import { useMediaStore } from '~/stores/mediaStore'
import { calculateStatusInfo } from '../../utils/availabilityDisplay'

const props = defineProps({
  mediaId: {
    type: String,
    required: true
  }
})

const mediaStore = useMediaStore()

// Nutzt den Cheerio-Endpunkt /api/detail
const { data, pending } = await useFetch('/api/detail', {
  query: { id: props.mediaId },
  lazy: true,
  server: false,
  onResponse({ response }) {
    const vobbData = response._data?.data
    if (response._data?.success && vobbData) {
      // Reaktiv den flachen Pinia Store anreichern
      mediaStore.enrichMediaItem(props.mediaId, {
        availability: vobbData.availability,
        author: vobbData.author,
        mediaType: vobbData.mediaType
      })
    }
  }
})

const statusInfo = computed(() => calculateStatusInfo(data.value?.data?.availability))
</script>

<template>
  <div class="mt-2 flex items-center">
    <div v-if="pending" class="flex items-center gap-2 animate-pulse">
      <div class="h-5 w-36 bg-gray-200 rounded-full"></div>
      <span class="text-xs text-gray-400">Prüfe Distanzen...</span>
    </div>

    <div v-else-if="data?.success" class="flex items-center gap-2">
      <span :class="['px-2.5 py-0.5 text-xs font-bold rounded-full border transition-all duration-300', statusInfo.color]">
        {{ statusInfo.label }}
      </span>
    </div>
  </div>
</template>