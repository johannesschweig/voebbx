# TODO
- marketing first: facebook?, blog post hacker news, linkedin, flyers, more stickers
- buy domain
  - check in google search console
- consisten back button styling


# Contemplating / Ideas
- korrekten footer anzeigen auf allen seiten (impressum, datenschutz, kontakt)
- seltenes fundstück / meistausgeliehene medien für artikel in der zeitung
- events for click on library and clicking on author
  - search by clicking on author
- /detail fails: we need a refetch button or something
- 2nd page search
- covers for books, e.g. https://www.voebb.de/vlb/cover/<isbn-wo-dashes>/m 200ms or open library https://covers.openlibrary.org/b/isbn/0385472579-M.jpg 600ms
  - covers on openlibrary are super sparse
  - voebb img needs a referrer (!headache): endpoint?
  - check google covers with api or someo other service
- a share button on the detail page
- rework navbar to header and menubar. authmodal as page. 
- show people recent searches
  - I would need to store those in localstorage
- availability fails: https://www.voebb.de/aDISWeb/app/prod00?sp=SAK35371610 Zusatzinfos statt Bestellmöglichkeit
- title fails: https://www.voebb.de/aDISWeb/app/prod00?sp=SAK34234459

# DONE
- where is schiller library: address on click
  - add data to libraries: district,opening horus, website
  - nice map illustration
- check/change email
- set zip code in search somehow
- better aggregation if zip code is default
- clicking on navbar / or pressing x in search does not clear the results
- reduce bounce rate before searching: suggestions for searches or sth
  - 40% (61/146) of people only go to home page and never search i.e. bounce
  -  popkultur (dune wüstenplanet) / spiele (siedler von catan) / hörbücher kinder (tonie eiskönigin)
- input numeric zip code
- icons for different media types
- zip code save validation
- add login to merkliste page as "Sync option"
- saving user location and watchlist w/o account
- better sorting of branches (see branchSorter)
- bookmark button on detail page
- navbar overflow mobile
- contact email
- display due days
- timeout while fetching Availabilitybadge -> id page -> back. does not get resolved
  - better caching handling. ask if data available, if not, get it and store it
  - detail: send 500. VÖBB Fetch Failed
- plz refresh does only work after relogin
- better analytics for ref=sticker
- docker ausbauen, falls alles stabil im backend läuft
- nette illustration, die erklärt, was die app macht
- kein detail fetch, wenn schon im store
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
-  Performance-Optimierung (Caching): Ein Server-Caching (z.B. mit Nuxt nitroStorage) für die Detailansichten einbauen, damit bereits geladene Bestandsdaten für einige Minuten zwischengespeichert werden und die Seiten blitzschnell laden. Für jetzt reicht erstmal pinia store und optimierte sucheperformance
  - search
    - cold (deployed): 50s
    - warm (deployed): 5s
  - detail
    - deployed: 4s
    
- job to check them regularly: watchlist is convenient enough
- show bestellmöglichkeit für magazin
  - signature is not unique for magazin stuff (see http://bibblitz.de/media/12485080). I would need to pass Standort (Magazin/Außenmagazin) or Bestellmöglichkeit (bestellbar)
- add link to google maps to library selection: not likely that people don't know the library they want to go to
- instant notifications when available: in app (native) or via email or in telegram
- zip code visualiziation: there are just too many zip codes. better label with district