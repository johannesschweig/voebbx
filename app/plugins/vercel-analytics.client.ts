// plugins/vercel-analytics.client.ts
export default defineNuxtPlugin(() => {
  if (localStorage.getItem('dev_mode') === 'true') return

  useHead({
    script: [
      {
        src: '/_vercel/insights/script.js',
        defer: true,
      }
    ]
  })
})