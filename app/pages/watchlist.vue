<script setup lang="ts">
import { useUserStore } from '~/stores/userStore'
import { useItemCacheStore } from '~/stores/itemCacheStore'
import AvailabilityBadge from '~/components/AvailabilityBadge.vue'
import ZipCode from '~/components/ZipCode.vue'

const userStore = useUserStore()
const itemCacheStore = useItemCacheStore()
const supabase = useSupabaseClient()
const user = useSupabaseUser()


async function handleLogout() {
  await supabase.auth.signOut()
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8">

    <div>
      <h1 class="text-2xl font-black mb-4">Deine Merkliste</h1>

      <div v-if="userStore.loading" class="text-center py-8 text-gray-500">
        Lade Merkliste aus Supabase...
      </div>

      <div v-else-if="userStore.watchlistIds.length === 0"
        class="text-center py-12 border-2 border-dashed rounded-xl text-gray-400">
        Deine Merkliste ist noch leer.
      </div>

      <div v-else class="space-y-4">
        <NuxtLink v-for="id in userStore.watchlistIds" :key="id" :to="`/media/${id}`"
          class="p-4 bg-white border border-gray-100 shadow-sm rounded-xl flex flex-col gap-2 sm:flex-row justify-between sm:items-start">
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {{ itemCacheStore.items[id]?.mediaType || 'Buch' }}
            </span>
            <h3 class="font-bold text-lg text-gray-900 mt-0.5">
              {{ itemCacheStore.items[id]?.title || 'Lädt Titel...' }}
            </h3>
            <p class="text-sm text-gray-500">
              {{ itemCacheStore.items[id]?.author || 'Unbekannter Autor' }}
            </p>

            <AvailabilityBadge :media-id="id" class="mt-2" />
          </div>

          <button @click.prevent="userStore.toggleBookmark(id)" class="self-start mt-2 sm:mt-0 btn btn-sm btn-danger">
            Entfernen
          </button>
        </NuxtLink>
      </div>
    </div>


    <h2 class="text-xl font-black mb-2">Stammbezirk</h2>
    <ZipCode />

    <div>
      <h2 class="text-xl font-black mb-2">Account Sync</h2>
      <p class="text-xs text-gray-500 mb-4">
        Erstelle dir einen kostenlosten Account, um deine Merkliste auf allen Geräten zu synchronisieren.
      </p>
      <div v-if="user" class="flex flex-col gap-2">
        <p class="text-sm text-gray-700">
          Angemeldet als <span class="font-bold">{{ user.email }}</span>
        </p>
        <button @click="handleLogout" class="md:self-start btn btn-md btn-secondary">
          Abmelden
        </button>
      </div>
      <div v-else class="flex flex-col gap-2">
        <button @click="userStore.showAuthModal = true" class="md:self-start btn btn-md btn-primary">
          Anmelden
        </button>
      </div>
    </div>
  </div>
</template>