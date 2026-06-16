<template>
  <div class="flex min-h-screen flex-col bg-slate-50/50 text-gray-900 antialiased selection:bg-blue-500 selection:text-white">
    <!-- Globale Navigationsleiste -->
    <AppNavbar />

    <!-- Hauptinhalt der jeweiligen Seite -->
    <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
      <slot />
    </main>

    <!-- Globaler Authentifizierungs-Modal (wird über den Pinia-Store gesteuert) -->
    <AuthModal />
  </div>
</template>
