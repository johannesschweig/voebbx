<template>
  <nav class="sticky top-0 z-[900] border-b border-gray-100 bg-white/80 backdrop-blur-md">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
      
      <NuxtLink to="/" class="text-xl font-black tracking-tight text-gray-900 hover:opacity-80 transition-opacity">
        BibBlitz
      </NuxtLink>

      <div class="flex items-center gap-2 sm:gap-3">
        
        <NuxtLink 
          to="/" 
          class="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all"
          active-class="bg-blue-50 text-blue-600 hover:bg-blue-50 hover:text-blue-600"
        >
          <span>🔍</span>
          <span>Suche</span>
        </NuxtLink>

        <button 
          @click="handleWatchlistClick"
          class="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all"
          :class="{ 'bg-blue-50 text-blue-600': route.path === '/watchlist' }"
        >
          <span>⭐</span>
          <span>Merkliste</span>
          <span 
            v-if="user && store.items.length > 0" 
            class="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-black text-white"
          >
            {{ store.items.length }}
          </span>
        </button>

        <button 
          v-if="user" 
          @click="handleLogout"
          class="ml-2 rounded-lg p-1.5 text-xs font-semibold text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Abmelden"
        >
          <span class="hidden md:inline">Abmelden</span>
        </button>

        <button 
          v-else
          @click="store.showAuthModal = true"
          class="ml-2 rounded-xl bg-gray-950 px-3.5 py-1.5 text-sm font-bold text-white shadow-sm hover:bg-gray-800 transition-all"
        >
          Anmelden
        </button>

      </div>

    </div>
  </nav>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useWatchlistStore } from '~/stores/watchlistStore'

const store = useWatchlistStore()
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const router = useRouter()
const route = useRoute() // 🟢 Neu hinzugefügt, um den aktiven State für die Merkliste zu tracken

onMounted(() => {
  if (user.value) {
    store.fetchWatchlist()
  }
})

watch(user, (newUser) => {
  if (newUser) {
    store.fetchWatchlist()
  } else {
    store.items = []
  }
})

function handleWatchlistClick() {
  if (!user.value) {
    store.showAuthModal = true
  } else {
    router.push('/watchlist')
  }
}

async function handleLogout() {
  await supabase.auth.signOut()
  router.push('/')
}
</script>