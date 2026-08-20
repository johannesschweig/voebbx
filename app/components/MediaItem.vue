<script setup lang="ts">
import AvailabilityBadge from '~/components/AvailabilityBadge.vue'
import { useItemCacheStore } from '~/stores/itemCacheStore'
import { getMediaTypeConfig } from '../../utils/mediaTypeMapping'

const props = defineProps<{
  mediaId: string
}>()

const itemCacheStore = useItemCacheStore()

const item = computed(() => itemCacheStore.items[props.mediaId])
const config = computed(() => getMediaTypeConfig(item.value?.mediaType ?? ''))
</script>

<template>
  <li class="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all">
    <div class="p-2 md:p-3">
      <NuxtLink :to="`/media/${props.mediaId}`" class="grid grid-cols-[52px_1fr] md:grid-cols-[72px_1fr] gap-3 min-w-0">
        <img :src="config.icon" :alt="config.label" class="w-12 md:w-16 p-1 md:p-2">
        <div class="flex flex-col min-w-0">
          <h3 class="font-semibold text-gray-900 text-sm md:text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
            {{ item?.title || 'Lädt Titel...' }}
          </h3>
          <p v-if="item?.author" class="text-xs md:text-sm text-gray-500 truncate mb-2">
            {{ item.author }}
          </p>
          <AvailabilityBadge :mediaId="props.mediaId" />
        </div>
      </NuxtLink>
    </div>
  </li>
</template>