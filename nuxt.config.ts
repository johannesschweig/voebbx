// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxtjs/supabase'],
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/*']
    }
  },
  nitro: {
    // Zwingt Nitro, diese Pakete im Vercel-Build komplett zu ignorieren
    externals: {
      external: ['axios', 'tough-cookie', 'axios-cookiejar-support', 'http-cookie-agent']
    }
  }
})