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

const user = useSupabaseUser()

watch(user, (newUser, oldUser) => {
  const newSub = newUser?.sub
  const oldSub = oldUser?.sub
  if (newSub === oldSub) return
  
  userStore.watchlistIds = []
  userStore.loading = false
  userStore.fetchUserData()
}) 
</script>