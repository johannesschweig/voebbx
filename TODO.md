# TODO
- show bestellmöglichkeit für magazin
- plz refresh does only work after relogin
- add link to google maps to library selection
- nette berlin illustration, die zeigt, wo man ist
- docker ausbauen, falls alles stabil im backend läuft
- kein detail fetch, wenn schon im store

# DONE
- suchperformance verbessern / playwright ablösen
- Standort-Abfrage dynamisieren: Die HTML5 Geolocation API im Frontend integrieren, um die Distanzen zu den Bibliotheken anhand deiner echten aktuellen Koordinaten zu berechnen, statt feste Werte zu nutzen.
  - users have to input their district
- empty result state
- watchlist
- availability score in der ergebnisliste
- deploy
- save records for later
- crawl first page of results
- display media type

# DROPPED
-  Performance-Optimierung (Caching): Ein Server-Caching (z.B. mit Nuxt nitroStorage) für die Detailansichten einbauen, damit bereits geladene Bestandsdaten für einige Minuten zwischengespeichert werden und die Seiten blitzschnell laden. Für jetzt reicht erstmal pinia store
- job to check them regularly: watchlist is convenient enough