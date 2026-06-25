<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMediaStore } from '~/stores/mediaStore'
import { useWatchlistStore } from '~/stores/watchlistStore'
import { calculateStatusInfo } from '../../utils/availabilityDisplay'

const props = defineProps({
  mediaId: {
    type: String,
    required: true
  }
})

const mediaStore = useMediaStore()
const watchlistStore = useWatchlistStore()

// Das HTML-Element, das wir beobachten wollen
const targetElement = ref(null)
let observer = null

// useFetch konfigurieren
const { data, pending, execute } = useFetch('/api/detail', {
  query: { id: props.mediaId },
  lazy: true,
  server: false,
  immediate: false, // 🔴 WICHTIG: Verhindert den automatischen Request beim Laden!
  onResponse({ response }) {
    const vobbData = response._data?.data
    if (response._data?.success && vobbData) {
      mediaStore.enrichMediaItem(props.mediaId, {
        availability: vobbData.availability,
        author: vobbData.author,
        mediaType: vobbData.mediaType
      })
      watchlistStore.enrichMediaItem(props.mediaId, {
        availability: vobbData.availability,
        author: vobbData.author,
        mediaType: vobbData.mediaType
      })
    }
  }
})

// Sichtbarkeit beobachten
onMounted(() => {
  observer = new IntersectionObserver(([entry]) => {
    // Sobald die Komponente sichtbar wird...
    if (entry.isIntersecting) {
      execute() // 🟢 Request manuell abfeuern!
      observer.disconnect() // Beobachtung beenden, wir brauchen die Daten nur einmal
    }
  }, {
    rootMargin: '0px'
  })

  if (targetElement.value) {
    observer.observe(targetElement.value)
  }
})

// Aufräumen, falls der Nutzer die Seite verlässt, bevor die Elemente sichtbar wurden
onUnmounted(() => {
  if (observer) observer.disconnect()
})

const statusInfo = computed(() => calculateStatusInfo(data.value?.data?.availability, watchlistStore.userCoords))
</script>

<template>
  <!-- ref="targetElement" verbindet das HTML mit unserem Observer -->
  <div ref="targetElement" class="mt-2 flex items-center min-h-[24px]">

    <!-- Lade-Zustand: Wird erst angezeigt, wenn das Element fast im Viewport ist -->
    <div v-if="pending" class="flex items-center gap-2 animate-pulse">
      <div class="h-5 w-36 bg-gray-200 rounded-full"></div>
      <span class="text-xs text-gray-400">Prüfe Verfügbarkeit...</span>
    </div>

    <!-- Anzeige nach erfolgreichem Fetch -->
    <div v-else-if="data?.success" class="flex items-center gap-2">
      <span
        :class="['px-2.5 py-0.5 text-xs font-bold rounded-full border transition-all duration-300', statusInfo.color]">
        {{ statusInfo.label }}
      </span>
    </div>

    <!-- Platzhalter für Elemente, die noch ganz weit unten und ungesehen sind -->
    <div v-else-if="!data" class="h-5 w-36 bg-gray-100 rounded-full opacity-50"></div>
  </div>
</template>