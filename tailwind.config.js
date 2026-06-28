module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./utils/**/*.{js,ts}", // 🌟 Wichtig, falls dort Klassen generiert werden!
    "./stores/**/*.{js,ts}" // 🌟 Wichtig für Pinia-Stores!
  ],
}