// plugins/vercel-analytics.client.ts
export default defineNuxtPlugin(() => {
  if (import.meta.dev) return

  const route = useRoute()

  // Falls du die Seite mit ?dev=true aufrufst, wird der Dev-Modus auf dem Gerät aktiviert
  if (route.query.dev === 'true') {
    localStorage.setItem('dev_mode', 'true')
  }

  // Falls du ihn mal wieder deaktivieren willst: ?dev=false
  if (route.query.dev === 'false') {
    localStorage.removeItem('dev_mode')
  }

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