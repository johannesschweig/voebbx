// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'BibBlitz - Suchen. Finden. Ausleihen.',
      link: [
        {
          rel: 'icon',
          type: 'image/svg+xml',
          // %E2%9A%A1 is the code for the ⚡ emoji
          href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>%E2%9A%A1</text></svg>'
        }
      ]
    }
  },
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
    externals: {
      inline: ['axios', 'tough-cookie', 'axios-cookiejar-support', 'http-cookie-agent']
    }
  }
})