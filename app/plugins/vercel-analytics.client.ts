// plugins/vercel-analytics.client.ts
export default defineNuxtPlugin(() => {
  useHead({
    script: [
      {
        src: '/_vercel/insights/script.js',
        defer: true,
      }
    ]
  })
})