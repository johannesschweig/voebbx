// app/composables/useUmami.ts
export const useUmami = () => {
  const track = (event: string, data?: Record<string, string | number>) => {
    if (import.meta.client && window.umami) {
      window.umami.track(event, data)
    }
  }
  return { track }
}