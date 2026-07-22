<script setup>
import { useUserStore } from '~/stores/userStore'
import { useMediaStore } from '#imports'

const userStore = useUserStore()
const mediaStore = useMediaStore()
const user = useSupabaseUser()
const supabase = useSupabaseClient()

async function handleLogout() {
  await supabase.auth.signOut()
}
</script>

<template>
  <nav class="sticky top-0 z-900 border-b border-gray-100 bg-white/80 backdrop-blur-md">
    <div class="mx-auto flex max-w-7xl justify-between px-4 py-3 sm:px-6">

      <NuxtLink to="/" @click="mediaStore.clearSearch()"
        class="text-xl font-black tracking-tight text-gray-900 hover:opacity-80 transition-opacity">
        BibBlitz
      </NuxtLink>

      <div class="flex gap-2 sm:gap-3">
        <NuxtLink :to="mediaStore.lastQuery ? `/?q=${encodeURIComponent(mediaStore.lastQuery)}` : '/'"
          class="flex gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition-all" inactive-class="text-gray-700"
          active-class="bg-blue-100 text-blue-700">
          <span>🔍</span>
          <span>Suche</span>
        </NuxtLink>

        <NuxtLink to="/watchlist" class="flex gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition-all"
          inactive-class="text-gray-700" active-class="bg-blue-100 text-blue-700">
          <span>⭐</span>
          <span>Merkliste</span>
          <span v-if="userStore.watchlistIds.length > 0"
            class="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-black text-white">
            {{ userStore.watchlistIds.length }}
          </span>
        </NuxtLink>

        <button v-if="user" @click="handleLogout" class="ml-2 btn btn-secondary btn-md hidden md:inline"
          title="Abmelden">
          <span>Abmelden</span>
        </button>

        <button v-else @click="userStore.showAuthModal = true"
          class="ml-2 btn btn-primary btn-md md:self-start hidden md:inline">
          Anmelden
        </button>

      </div>

    </div>
  </nav>
</template>