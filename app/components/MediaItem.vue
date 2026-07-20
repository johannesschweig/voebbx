<script setup lang="ts">
import AvailabilityBadge from '~/components/AvailabilityBadge.vue'
import { useItemCacheStore } from '~/stores/itemCacheStore'

const props = defineProps<{
  mediaId: string
}>()

const itemCacheStore = useItemCacheStore()
const ICON_URL = 'https://www.voebb.de/aDISWeb_kopac86/img/medien/'
// buch, band, konventionelles spiel, dvd, medienkombination, mp3
const icon = computed(() => {
  const mediaType = itemCacheStore.items[props.mediaId]?.mediaType.toLowerCase()
  if (!mediaType) return ''
  switch (mediaType) {
    case 'buch':
    case 'band':
    case 'hochschulschrift':
      return `${ICON_URL}buch.svg`
    case 'konventionelles spiel':
      return `${ICON_URL}brettspiel.svg`
    case 'dvd':
      return `${ICON_URL}dvd.svg`
    case 'dvd-rom':
      return `${ICON_URL}dvd-rom.svg`
    case 'medienkombination':
      return `${ICON_URL}medienkombination.svg`
    case 'mp3':
      return `${ICON_URL}mp3.svg`
    case 'noten':
      return `${ICON_URL}noten.svg`
    case 'cd':
      return `${ICON_URL}cd.svg`
    case 'schallplatte':
      return `${ICON_URL}lp.svg`
    case 'karte/plan':
      return `${ICON_URL}karte.svg`
    case 'video':
      return `${ICON_URL}video.svg`
    case 'gerät':
      return `${ICON_URL}datentraeger.svg`
    case 'e-ressource':
      return `${ICON_URL}eressource.svg`
    case 'blu-ray disc':
    case 'ultra hd blu-ray':
      return `${ICON_URL}bluray.svg`
    case 'plastik':
      return `${ICON_URL}plastik.svg`
    default:
      return ''
  }
})
</script>

<template>
  <li
    class="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all">
    <div class="p-2 md:p-3">
      <NuxtLink :to="`/media/${props.mediaId}`" class="grid grid-cols-[52px_1fr] md:grid-cols-[72px_1fr] gap-3 min-w-0">
          <!-- alt="icon" -->
        <img :src="icon"
          :alt="`${itemCacheStore.items[props.mediaId]?.mediaType.toLowerCase()}`"
          class="w-12 md:w-16 p-1 md:p-2 text-sm">
        <div class="flex flex-col min-w-0">
          <h3
            class="font-semibold text-gray-900 text-sm md:text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
            {{ itemCacheStore.items[props.mediaId]?.title || 'Lädt Titel...' }}
          </h3>
          <p v-if="itemCacheStore.items[props.mediaId]?.author"
            class="text-xs md:text-sm text-gray-500 truncate mb-2">
            {{ itemCacheStore.items[props.mediaId]?.author }}
          </p>
          <AvailabilityBadge :mediaId="props.mediaId" />
        </div>
      </NuxtLink>
    </div>
  </li>
</template>