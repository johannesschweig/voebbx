<!-- app.vue -->
<template>
  <div>
    <NuxtLayout>
      <NuxtPage :keepalive="{ max: 5 }" />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/userStore'

const userStore = useUserStore()

onMounted(() => {
  userStore.fetchUserData()
})
</script>