<template>
  <div 
    v-if="store.showAuthModal" 
    class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    @click.self="store.showAuthModal = false"
  >
    <div class="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl transition-all">
      <!-- Schließen Button -->
      <button 
        class="absolute right-4 top-4 text-2xl text-gray-400 hover:text-gray-600 transition-colors" 
        @click="store.showAuthModal = false"
      >
        &times;
      </button>
      
      <h2 class="text-2xl font-black text-gray-900 tracking-tight">
        {{ isSignUp ? 'Konto erstellen' : 'Anmelden' }}
      </h2>
      <p class="mt-1 text-sm text-gray-500 mb-6">
        {{ isSignUp ? 'Erstelle ein kostenloses Konto, um deine Merkliste zu speichern.' : 'Melde dich an, um deine Merkliste zu speichern.' }}
      </p>

      <form @submit.prevent="handleAuth" class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            E-Mail-Adresse
          </label>
          <input 
            v-model="email" 
            type="email" 
            required 
            placeholder="name@beispiel.de" 
            class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            Passwort
          </label>
          <input 
            v-model="password" 
            type="password" 
            required 
            placeholder="••••••••" 
            class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        <p v-if="errorMessage" class="text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
          ⚠️ {{ errorMessage }}
        </p>
        
        <p v-if="successMessage" class="text-xs font-semibold text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
          ✅ {{ successMessage }}
        </p>

        <button 
          type="submit" 
          :disabled="loading" 
          class="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Bitte warten...' : (isSignUp ? 'Registrieren' : 'Einloggen') }}
        </button>
      </form>

      <div class="mt-6 text-center border-t border-gray-100 pt-4">
        <button 
          @click="isSignUp = !isSignUp" 
          class="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          {{ isSignUp ? 'Bereits ein Konto? Hier einloggen' : 'Neu hier? Jetzt kostenloses Konto erstellen' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '~/stores/userStore'

const store = useUserStore()
const supabase = useSupabaseClient()

const email = ref('')
const password = ref('')
const isSignUp = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function handleAuth() {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  if (isSignUp.value) {
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })
    if (error) {
      errorMessage.value = error.message
    } else {
      successMessage.value = 'Registrierung erfolgreich! Bitte prüfe deine E-Mails zur Bestätigung.'
    }
  } else {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) {
      errorMessage.value = error.message
    } else {
      await store.fetchUserData()
      store.showAuthModal = false
    }
  }
  loading.value = false
}
</script>