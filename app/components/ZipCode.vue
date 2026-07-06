<script setup lang="ts">
import { useUserStore } from '~/stores/userStore'
import berlinZips from '~/assets/berlinZipCodes.json'

const userStore = useUserStore()
const localZipInput = ref(userStore.userZip)
const editing = ref(false)

const isValidZip = computed(() => {
  const zip = localZipInput.value.trim()
  return berlinZips.hasOwnProperty(zip)
})

const isDirty = computed(() => localZipInput.value !== userStore.userZip)
const canSave = computed(() => isValidZip.value && isDirty.value)

watch(() => userStore.userZip, (newZip) => {
  localZipInput.value = newZip
}, { immediate: true })

function saveLocation() {
  userStore.saveLocation(localZipInput.value)
    (window as any).umami?.track('zip-save', { query: localZipInput.value.substring(0, 2) + 'XXXX' })
}
</script>

<template>
  <div class="space-y-3">
    <div>
      <h2 class="font-bold text-gray-900 text-xl flex items-center gap-1.5">
        📍 Dein Stammbezirk
      </h2>
      <p class="text-lg">
        <span :class="userStore.userZipDefault ? 'text-gray-500 italic' : 'font-bold text-blue-700'">{{
          userStore.userZip
          }}
          {{ userStore.userZipDefault ? '(Standardwert)' : `(${(berlinZips as any)[userStore.userZip]?.district })` }}</span>
 
      </p>
    </div>
    <p class="text-xs text-gray-500">
      Wir nutzen diese Information, um die Bibliotheken nach Entfernung zu sortieren.
    </p>

    <div class="flex flex-col gap-2">
      <button v-if="!editing" @click="editing = true" class="btn btn-md md:self-start" :class="userStore.userZipDefault ? 'btn-primary' : 'btn-secondary'">Ändern</button>
      <div v-else class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <input v-model="localZipInput" type="text" placeholder="z.B. 10559" @keyup.enter="saveLocation"
            class="w-28 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-center font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
          <span v-if="isValidZip">{{ (berlinZips as any)[localZipInput.trim()]?.district }}</span>
        </div>
        <button @click="saveLocation" :disabled="!canSave"
          class="btn btn-md md:self-start"
          :class="canSave ? 'btn-primary' : 'btn-secondary'">
          Speichern
        </button>
      </div>
    </div>
  </div>
</template>