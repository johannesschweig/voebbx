<template>
  <button @click.stop="userStore.toggleBookmark(itemCacheStore.items[props.mediaId].id)"
    class="btn btn-sm border" :class="userStore.isBookmarked(props.mediaId)
      ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100 active:bg-amber-100'
      : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 active:bg-gray-100 active:text-gray-700'" data-umami-event="bookmark-button-clicked">
    <span>{{ userStore.isBookmarked(props.mediaId) ? '★' : '☆' }}</span>
    <span :class="props.context === 'list' ? 'hidden sm:inline' : ''">{{ userStore.isBookmarked(props.mediaId) ? 'Gemerkt' : 'Merken' }}</span>
  </button>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/userStore'
import { useItemCacheStore } from '~/stores/itemCacheStore'

const props = defineProps<{
  mediaId: string,
  context: 'list' | 'detail' // context of button to determine styling
}>()
const userStore = useUserStore()
const itemCacheStore = useItemCacheStore()

</script>