<!-- components/MediaTypeFilter.vue -->
<script setup lang="ts">
defineProps<{
  types: Array<{ type: string; count: number }>
  modelValue: string | null
  totalCount: number
}>()


const { track } = useUmami()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

function formatLabel(type: string) {
  if (!type) return ''
  return type.charAt(0).toUpperCase() + type.slice(1)
}

function selectType(type: string | null) {
  emit('update:modelValue', type)
  track('click-media-filter', { filter: type || '' })
}
</script>

<template>
  <div 
    v-if="types.length > 0" 
    class="flex items-center gap-2 py-1 overflow-x-auto flex-nowrap -mx-4 px-4 sm:flex-wrap sm:overflow-visible sm:mx-0 sm:px-0 no-scrollbar"
  >
    <!-- Button für "Alle" -->
    <button
      type="button"
      @click="selectType(null)"
      :class="[
        'shrink-0 whitespace-nowrap px-3 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer border',
        modelValue === null
          ? 'bg-blue-100 text-blue-950  border-blue-200'
          : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200'
      ]"
    >
      Alle ({{ totalCount }})
    </button>

    <!-- Buttons für einzelne Medientypen -->
    <button
      v-for="item in types"
      :key="item.type"
      type="button"
      @click="selectType(modelValue === item.type ? null : item.type)"
      :class="[
        'shrink-0 whitespace-nowrap px-3 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer border',
        modelValue === item.type
          ? 'bg-blue-100 text-blue-950  border-blue-200'
          : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200'
      ]"
    >
      {{ formatLabel(item.type) }} ({{ item.count }})
    </button>
  </div>
</template>

<style scoped>
/* Versteckt die Scrollbar auf allen Browsern für ein cleanes App-Feeling auf Mobile */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;  /* IE & Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>