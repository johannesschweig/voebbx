<script setup lang="ts">
import { ref } from 'vue'

const openIndex = ref<number | null>(null)

const faqs = [
  {
    id: 'distance',
    question: 'Wie wird die Entfernung berechnet?',
    answer: 'Zwischen deinem Kiez und der Bibliothek. Standard ist die PLZ 10178 (Mitte). Du kannst deine eigene PLZ ganz einfach in den Einstellungen der Merkliste hinterlegen.'
  },
  {
    id: 'data-source',
    question: 'Woher stammen die Daten?',
    answer: 'Live von voebb.de. Da es keine offizielle API gibt, liest ein optimiertes Skript die Infos im Hintergrund aus.'
  },
  {
    id: 'data-storage',
    question: 'Wo werden meine Daten (PLZ, Merkliste) gespeichert?',
    answer: 'Deine Daten werden lokal im Browser gespeichert. Wenn du ein Konto erstellst, werden sie zusätzlich in einer Datenbank (Supabase) gespeichert, um deine Daten auf allen Geräten zu synchronisieren.'
  },
  {
    id: 'sync-watchlist',
    question: 'Wie kann ich meine Merkliste synchronisieren?',
    answer: 'Erstelle dir einen kostenlosten Account, um deine Merkliste auf allen Geräten zu synchronisieren.'
  },
  {
    id: 'fewer-results',
    question: 'Warum finde ich weniger Treffer als beim VÖBB?',
    answer: 'BibBlitz lädt aus Performancegründen nur die erste Ergebnisseite. Das schont die Infrastruktur der Bibliotheken und sorgt dafür, dass deine Suche bei uns blitzschnell bleibt.'
  },
  {
    id: 'app-store',
    question: 'Gibt es eine App für den App Store?',
    answer: 'Nein, aber du kannst BibBlitz im Browser über das „Teilen“-Menü einfach zum Startbildschirm hinzufügen. Es verhält sich dann genau wie eine native App.'
  }
]

const toggleFaq = (index: number) => {
  openIndex.value = openIndex.value === index ? null : index
  ; (window as any).umami?.track('toggle-faq', { query: faqs[index]?.id })

}
</script>

<template>
  <section class="w-full max-w-md mx-auto px-4 py-8 font-sans">
    <h2 class="text-xl font-bold text-gray-900 mb-5 px-1">Häufige Fragen</h2>

    <div class="space-y-3">
      <div v-for="(faq, index) in faqs" :key="index"
        class="border border-gray-200 rounded-2xl bg-white overflow-hidden transition-all duration-200">
        <button @click="toggleFaq(index)"
          class="w-full flex items-center justify-between p-4 text-left select-none focus:outline-none">
          <span class="text-sm font-semibold text-gray-900 pr-4">
            {{ faq.question }}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
            stroke="currentColor" class="w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0"
            :class="{ 'rotate-180 text-gray-900': openIndex === index }">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        <div v-show="openIndex === index" class="border-t border-gray-100 bg-gray-50/50">
          <p class="p-4 text-sm text-gray-700 leading-relaxed">
            {{ faq.answer }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>