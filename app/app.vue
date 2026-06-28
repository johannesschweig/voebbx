<!-- app.vue -->
<template>
  <div>
    <NuxtLayout>
      <NuxtPage :keepalive="{ max: 5 }" />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useSupabaseUser } from '#imports'
import { useWatchlistStore } from '~/stores/watchlistStore'

const user = useSupabaseUser()
const watchlistStore = useWatchlistStore()

// 🌟 Überwache den User global. Sobald Supabase die Session geladen hat,
// wird die PLB sofort im Store hinterlegt.
watch(user, (newUser) => {
  if (newUser?.user_metadata?.zip_code) {
    watchlistStore.updateLocation(newUser.user_metadata.zip_code)
    console.log('PLZ aus Supabase geladen:', newUser.user_metadata.zip_code)
  }
}, { immediate: true })
</script>