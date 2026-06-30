<template>
  <button @click.stop="watchlistStore.toggleBookmark(itemCacheStore.items[props.mediaId].id)"
    class="shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all" :class="watchlistStore.isBookmarked(props.mediaId)
      ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
      : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700'">
    <span>{{ watchlistStore.isBookmarked(props.mediaId) ? '★' : '☆' }}</span>
    <span :class="props.context === 'list' ? 'hidden sm:inline' : ''">{{ watchlistStore.isBookmarked(props.mediaId) ? 'Gemerkt' : 'Merken' }}</span>
  </button>
</template>

<script setup lang="ts">
import { useWatchlistStore } from '~/stores/watchlistStore'
import { useItemCacheStore } from '~/stores/itemCacheStore'

const props = defineProps<{
  mediaId: string,
  context: 'list' | 'detail' // context of button to determine styling
}>()
const watchlistStore = useWatchlistStore()
const itemCacheStore = useItemCacheStore()

</script>