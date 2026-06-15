<!-- pages/index.vue -->
<template>
  <div class="max-w-2xl mx-auto p-4 font-sans text-gray-800">
    <header class="text-center my-12">
      <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
        📚 VÖBB<span class="text-blue-600">x</span>
      </h1>
      <p class="text-gray-500 text-sm">Finde Medien in deiner Nähe – schnell und ohne Overhead.</p>
    </header>

    <!-- Suchformular -->
    <form @submit.prevent="handleSearch" class="flex gap-2 mb-8">
      <input 
        v-model="searchQuery"
        type="text" 
        placeholder="Titel, Autor oder Spiel suchen..." 
        class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
        :disabled="loading"
      />
      <button 
        type="submit" 
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition shadow-sm disabled:bg-blue-400"
        :disabled="loading || !searchQuery.trim()"
      >
        {{ loading ? 'Sucht...' : 'Suchen' }}
      </button>
    </form>

    <!-- Lade-Zustand -->
    <div v-if="loading" class="text-center py-12 text-gray-500 animate-pulse">
      <p class="text-lg">Frage VÖBB-Katalog ab...</p>
    </div>

    <!-- Dummy-Ergebnisse (Bis wir die Playwright-Suche anbinden) -->
    <div v-else-if="results.length > 0" class="space-y-4">
      <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Suchergebnisse</h2>
      
      <div 
        v-for="item in results" 
        :key="item.id"
        class="border rounded-lg p-4 bg-white shadow-sm hover:border-blue-400 transition cursor-pointer"
        @click="goToMedia(item.id)"
      >
        <div class="flex justify-between items-start gap-2">
          <div>
            <h3 class="font-bold text-gray-900 hover:text-blue-600 transition">{{ item.title }}</h3>
            <p class="text-xs text-gray-500 mt-1">✍️ {{ item.author }}</p>
          </div>
          <span class="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded font-medium whitespace-nowrap">
            {{ item.mediaType }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')
const loading = ref(false)
const results = ref([])

async function handleSearch() {
  if (!searchQuery.value.trim()) return
  loading.value = true
  
  // Temporäre Dummy-Ergebnisse, damit du das Frontend testen kannst.
  // Sobald wir die echte Suche haben, ersetzen wir das durch ein echtes $fetch!
  setTimeout(() => {
    results.value = [
      {
        id: '35233179',
        title: 'Dorfromantik Duell',
        author: 'Wiese, Jens [Illustrator/in]',
        mediaType: 'Konventionelles Spiel'
      },
      {
        id: '12345678', // Nur ein Platzhalter
        title: 'Catan - Das Spiel',
        author: 'Teuber, Klaus',
        mediaType: 'Konventionelles Spiel'
      }
    ]
    loading.value = false
  }, 800)
}

function goToMedia(id) {
  router.push(`/media/${id}`)
}
</script>