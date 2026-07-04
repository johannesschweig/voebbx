<template>
  <nav class="sticky top-0 z-[900] border-b border-gray-100 bg-white/80 backdrop-blur-md">
    <div class="mx-auto flex max-w-7xl watchlistIds-center justify-between px-4 py-3 sm:px-6">
      
      <NuxtLink to="/" class="text-xl font-black tracking-tight text-gray-900 hover:opacity-80 transition-opacity">
        BibBlitz
      </NuxtLink>

      <div class="flex watchlistIds-center gap-2 sm:gap-3">
        
        <NuxtLink 
          to="/" 
          class="flex watchlistIds-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-gray-700 transition-all"
          active-class="bg-blue-100 text-blue-600"
        >
          <span>🔍</span>
          <span>Suche</span>
        </NuxtLink>

        <NuxtLink 
          to="/watchlist"
          class="flex watchlistIds-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-gray-700 transition-all"
          active-class="bg-blue-100 text-blue-600"
        >
          <span>⭐</span>
          <span>Merkliste</span>
          <span 
            v-if="store.watchlistIds.length > 0" 
            class="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-black text-white"
          >
            {{ store.watchlistIds.length }}
          </span>
        </NuxtLink>

        <button 
          v-if="user" 
          @click="handleLogout"
          class="ml-2 rounded-lg p-1.5 text-xs font-semibold text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors hidden md:inline"
          title="Abmelden"
        >
          <span>Abmelden</span>
        </button>

        <button 
          v-else
          @click="store.showAuthModal = true"
          class="ml-2 rounded-xl bg-gray-950 px-3.5 py-1.5 text-sm font-bold text-white shadow-sm hover:bg-gray-800 transition-all hidden md:inline"
        >
          Anmelden
        </button>

      </div>

    </div>
  </nav>
</template>

<script setup>
import { useUserStore } from '~/stores/userStore'

const store = useUserStore()
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const router = useRouter()

async function handleLogout() {
  await supabase.auth.signOut()
  router.push('/')
}
</script>