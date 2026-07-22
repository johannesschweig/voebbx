import { defineStore } from 'pinia'
import berlinZips from '~/assets/berlinZipCodes.json'

const LOCAL_ZIP_KEY = 'bibblitz_zip'

export const useUserStore = defineStore('user', {
  state: () => ({
    userZip: (import.meta.client ? localStorage.getItem(LOCAL_ZIP_KEY) : null) || '10178',
    userCoords: { lat: 52.5219, lon: 13.4132 },
    userZipDefault: true,
    showAuthModal: false,
  }),
  actions: {
    async fetchUserData() {
      const savedZip = localStorage.getItem(LOCAL_ZIP_KEY)
      if (savedZip) this.saveLocation(savedZip)
    },

    async saveLocation(zipCode: string) {
      const cleanZip = zipCode.trim()
      if (!cleanZip) return

      const lookup = berlinZips as Record<string, { lat: number; lon: number }>
      if (!lookup[cleanZip]) return

      this.userZip = cleanZip
      this.userCoords = { lat: lookup[cleanZip].lat, lon: lookup[cleanZip].lon }
      this.userZipDefault = false

      localStorage.setItem(LOCAL_ZIP_KEY, cleanZip)
    },
  }
})