export interface LibraryConfig {
  name: string;
  address: string;
  distanceKm: number;
}

// Ordered from closest (<1km) to farthest (~10km) from your home
export const LIBRARY_DISTANCES: LibraryConfig[] = [
  {
    "name": "Fahrbibliothek Mitte 5",
    "address": "Perleberger Str. 33, 10559 Berlin",
    "distanceKm": 1.569
  },
  {
    "name": "Bruno-Loesche-Bibliothek",
    "address": "Bruno-Lösche, Perleberger Str. 33, 10559 Berlin",
    "distanceKm": 1.572
  },
  {
    "name": "Hansabibliothek",
    "address": "Hansabibliothek, Altonaer Str. 15, 10557 Berlin",
    "distanceKm": 1.616
  },
  {
    "name": "Kurt-Tucholsky-Bibliothek (Mitte)",
    "address": "Kurt-Tucholsky-Bibliothek, Rostocker Str. 32b, 10553 Berlin",
    "distanceKm": 3.008
  },
  {
    "name": "Bibliothek Tiergarten Süd",
    "address": "Tiergarten Süd, Lützowstr. 27, 10785 Berlin",
    "distanceKm": 3.161
  },
  {
    "name": "Bezirkszentralbibliothek Philipp Schaeffer",
    "address": "Brunnenstr. 181, 10119 Berlin",
    "distanceKm": 4.125
  },
  {
    "name": "Schiller-Bibliothek",
    "address": "Schiller - Bibliothek, Müllerstr. 149, 13353 Berlin",
    "distanceKm": 4.19
  },
  {
    "name": "Stadtteilbibliothek Schöneberg-Nord",
    "address": "Pallasstr. 27, 10781 Berlin",
    "distanceKm": 4.244
  },
  {
    "name": "Berliner Stadtbibliothek (BStB)",
    "address": "Breite Str. 30-36, 10178 Berlin",
    "distanceKm": 4.284
  },
  {
    "name": "Berlin-Sammlungen",
    "address": "Breite Str. 30/31, 10178 Berlin",
    "distanceKm": 4.314
  },
  {
    "name": "Amerika-Gedenkbibliothek (AGB)",
    "address": "Blücherplatz 1, 10961 Berlin",
    "distanceKm": 4.353
  },
  {
    "name": "Außenmagazin",
    "address": "Blücherplatz 1, 10961 Berlin",
    "distanceKm": 4.353
  },
  {
    "name": "Kinder- und Jugendbibliothek mit Lernzentrum",
    "address": "Jugendbibliothek mit Lernzentrum, Blücherplatz 1, 10961 Berlin",
    "distanceKm": 4.594
  },
  {
    "name": "Thomas-Dehler-Bibliothek",
    "address": "10825 Berlin",
    "distanceKm": 4.951
  },
  {
    "name": "Heinrich-Schulz-Bibliothek mit Musikabteilung",
    "address": "Otto-Suhr-Allee 98, 10585 Berlin",
    "distanceKm": 4.972
  },
  {
    "name": "Mittelpunktbibliothek Schöneberg",
    "address": "Hauptstr. 40, 10827 Berlin",
    "distanceKm": 5.217
  },
  {
    "name": "Bibliothek am Luisenbad",
    "address": "Badstr. 39, 13357 Berlin",
    "distanceKm": 5.483
  },
  {
    "name": "Fahrbibliothek Mitte Bus 1",
    "address": "Badstr. 39, 13357 Berlin",
    "distanceKm": 5.483
  },
  {
    "name": "Fahrbibliothek Mitte Bus 2",
    "address": "Badstr. 39, 13357 Berlin",
    "distanceKm": 5.483
  },
  {
    "name": "Fahrbibliothek Mitte Bus 3",
    "address": "Badstr. 39, 13357 Berlin",
    "distanceKm": 5.483
  },
  {
    "name": "Dietrich-Bonhoeffer-Bibliothek",
    "address": "Mittelpunktbibliothek, Brandenburgische Str. 2, 10713 Berlin",
    "distanceKm": 5.671
  },
  {
    "name": "Stadtteilbibliothek Friedrich von Raumer",
    "address": "Dudenstr. 18 - 20, 10965 Berlin",
    "distanceKm": 5.749
  },
  {
    "name": "Bibliothek am Schäfersee Stadtteilbibliothek Reinickendorf-Ost",
    "address": "Markstrasse 36, 13409 Berlin",
    "distanceKm": 5.754
  },
  {
    "name": "Mittelpunktbibliothek Wilhelm Liebknecht / Namik Kemal",
    "address": "Adalbertstr. 2, 10999 Berlin",
    "distanceKm": 6.071
  },
  {
    "name": "Bettina-von-Arnim-Bibliothek",
    "address": "Schönhauser Allee 75, 10439 Berlin",
    "distanceKm": 6.124
  },
  {
    "name": "Stadtteilbibliothek Halemweg",
    "address": "Halemweg 18, 13627 Berlin",
    "distanceKm": 6.256
  },
  {
    "name": "Ingeborg-Bachmann-Bibliothek",
    "address": "Nehringstr. 10, 14059 Berlin",
    "distanceKm": 6.289
  },
  {
    "name": "Bibliothek am Wasserturm",
    "address": "Prenzlauer Allee 227/228, 10405 Berlin",
    "distanceKm": 6.854
  },
  {
    "name": "Museum Pankow - Termin nach Absprache",
    "address": "Prenzlauer Allee 227/228, 10405 Berlin",
    "distanceKm": 6.854
  },
  {
    "name": "Familienbibliothek Else Ury",
    "address": "Glogauer Str. 13, 10999 Berlin",
    "distanceKm": 7.68
  },
  {
    "name": "Kleiner Bücherbus Reinickendorf",
    "address": "Auguste-Viktoria-Allee 29-31, 13403 Berlin",
    "distanceKm": 7.681
  },
  {
    "name": "Kurt-Tucholsky-Bibliothek (Pankow)",
    "address": "Esmarchstr. 18, 10407 Berlin",
    "distanceKm": 7.709
  },
  {
    "name": "Heinrich-Böll-Bibliothek",
    "address": "Bezirkszentralbibliothek, Greifswalder Str. 87, 10409 Berlin",
    "distanceKm": 7.824
  },
  {
    "name": "Bibl. Reinickendorf - West",
    "address": "Reinickendorf-West, Auguste-Viktoria-Allee 29-31, 13403 Berlin",
    "distanceKm": 7.864
  },
  {
    "name": "Johanna-Moosdorf-Bibliothek",
    "address": "Westendallee 45, 14052 Berlin",
    "distanceKm": 7.913
  },
  {
    "name": "Adolf-Reichwein-Bibliothek",
    "address": "Berkaer Str. 7, 14199 Berlin",
    "distanceKm": 8.021
  },
  {
    "name": "Bezirkszentralbibliothek Tempelhof-Schöneberg",
    "address": "Götzstr. 8/10/12, 12099 Berlin",
    "distanceKm": 8.11
  },
  {
    "name": "Helene-Nathan-Bibliothek",
    "address": "Karl-Marx-Straße 66, Parkdeck 4, 12043 Berlin",
    "distanceKm": 8.2
  },
  {
    "name": "Eberhard-Alexander-Burgh-Bibliothek",
    "address": "Rüdesheimer Str. 14, 14197 Berlin",
    "distanceKm": 8.326
  },
  {
    "name": "Janusz-Korczak-Bibliothek",
    "address": "Berliner Str. 120/121, 13187 Berlin",
    "distanceKm": 8.655
  },
  {
    "name": "Bezirkszentralbibliothek Pablo Neruda",
    "address": "Frankfurter Allee 14 A, 10247 Berlin",
    "distanceKm": 8.771
  },
  {
    "name": "BiboBike (mobile Bibliotheksstation)",
    "address": "Frankfurter Allee 14a, 10247 Berlin",
    "distanceKm": 8.771
  },
  {
    "name": "Wolfdietrich-Schnurre-Bibliothek",
    "address": "Bizetstraße 41, 13088 Berlin",
    "distanceKm": 8.807
  },
  {
    "name": "Stadtteilbibliothek Alt-Treptow Manfred Bofinger",
    "address": "Karl-Kunger-Str. 30, 12435 Berlin",
    "distanceKm": 9.055
  },
  {
    "name": "Ingeborg-Drewitz-Bibliothek",
    "address": "Grunewaldstr. 3, 12165 Berlin",
    "distanceKm": 9.233
  },
  {
    "name": "Fahrbibliothek Tempelhof-Schöneberg",
    "address": "12099 Berlin",
    "distanceKm": 9.474
  },
  {
    "name": "Blindenbibliothek Betty Hirsch",
    "address": "Rothenburgstr. 14, 12165 Berlin",
    "distanceKm": 9.509
  },
  {
    "name": "Egon-Erwin-Kisch-Bibliothek",
    "address": "Frankfurter Allee 149, 10365 Berlin",
    "distanceKm": 9.745
  },
  {
    "name": "Stadtteilbibliothek Haselhorst",
    "address": "Gartenfelder Str. 104, 13599 Berlin",
    "distanceKm": 9.845
  },
  {
    "name": "Anton-Saefkow-Bibliothek",
    "address": "Anton-Saefkow-Platz 14, 10369 Berlin",
    "distanceKm": 10.53
  },
  {
    "name": "Grosser Bücherbus Reinickendorf",
    "address": "Königshorster Str. 6, 13439 Berlin",
    "distanceKm": 11.221
  },
  {
    "name": "Bib Bee Reinickendorf",
    "address": "Karolinenstr. 19, 13507 Berlin",
    "distanceKm": 11.241
  },
  {
    "name": "Humboldt-Bibliothek",
    "address": "Karolinenstraße 19, 13507 Berlin",
    "distanceKm": 11.241
  },
  {
    "name": "Heimatmuseum Neukölln (kein Ausgabeort)",
    "address": "Alt Britz 81, 12359 Berlin",
    "distanceKm": 11.98
  },
  {
    "name": "Fahrbibliothek Spandau",
    "address": "Carl-Schurz-Str. 13, 13597 Berlin",
    "distanceKm": 12.027
  },
  {
    "name": "Hauptbibliothek Spandau",
    "address": "Carl-Schurz-Strasse 13, 13597 Berlin",
    "distanceKm": 12.027
  },
  {
    "name": "Bibliothek Märkisches Viertel",
    "address": "Wilhelmsruher Damm 142 C, 13439 Berlin",
    "distanceKm": 12.118
  },
  {
    "name": "Stadtteilbibliothek Lankwitz",
    "address": "Bruchwitzstr. 37, 12247 Berlin",
    "distanceKm": 12.413
  },
  {
    "name": "Stadtteilbibliothek Hakenfelde",
    "address": "Iznikstr. 2, 13587 Berlin",
    "distanceKm": 12.612
  },
  {
    "name": "Fahrbibliothek Steglitz-Zehlendorf",
    "address": "Zehlendorf, Berlin",
    "distanceKm": 13.129
  },
  {
    "name": "Margarete-Kubicka-Bibliothek",
    "address": "Gutschmidtstr. 33, 12359 Berlin",
    "distanceKm": 13.299
  },
  {
    "name": "Gottfried-Benn-Bibliothek",
    "address": "Nentershäuser Platz 1, 14163 Berlin",
    "distanceKm": 13.721
  },
  {
    "name": "Stadtteilbibliothek Falkenhagener Feld",
    "address": "Westerwaldstr. 9, 13589 Berlin",
    "distanceKm": 13.832
  },
  {
    "name": "Bodo-Uhse-Bibliothek",
    "address": "Erich-Kurz-Str. 9, 10319 Berlin",
    "distanceKm": 14.155
  },
  {
    "name": "Anna-Seghers-Bibliothek",
    "address": "Prerower Platz 2, 13051 Berlin",
    "distanceKm": 14.276
  },
  {
    "name": "Stadtteilbibliothek Marienfelde",
    "address": "12277 Berlin",
    "distanceKm": 14.596
  },
  {
    "name": "Mittelpunktbibliothek Treptow Alte Feuerwache",
    "address": "Michael-Brückner-Str. 9, 12439 Berlin",
    "distanceKm": 15.048
  },
  {
    "name": "Gertrud-Junge-Bibliothek",
    "address": "Bat-Yam-Platz 1, 12353 Berlin",
    "distanceKm": 15.594
  },
  {
    "name": "Stadtteilbibliothek Erich Weinert",
    "address": "Helene-Weigel-Platz 4, 12681 Berlin",
    "distanceKm": 16.018
  },
  {
    "name": "Bezirkszentralbibliothek Mark Twain",
    "address": "Marzahner Promenade 54, 12679 Berlin",
    "distanceKm": 16.333
  },
  {
    "name": "Musikbibliothek (in der Mark-Twain-Bibliothek)",
    "address": "Marzahner Promenade 54, 12679 Berlin",
    "distanceKm": 16.333
  },
  {
    "name": "Bibliothek Frohnau",
    "address": "Fuchssteinerweg 17, 13465 Berlin",
    "distanceKm": 16.687
  },
  {
    "name": "Gertrud-Haß-Bibliothek",
    "address": "Alt-Rudow 45, 12357 Berlin",
    "distanceKm": 16.757
  },
  {
    "name": "Stadtteilbibliothek Heerstrasse",
    "address": "Obstallee 22F, 13593 Berlin",
    "distanceKm": 16.881
  },
  {
    "name": "Stadtteilbibliothek Lichtenrade",
    "address": "Steinstraße 41, 12307 Berlin",
    "distanceKm": 17.129
  },
  {
    "name": "Stadtteilbibliothek Adlershof Stefan Heym",
    "address": "Dörpfeldstr. 52/56, 12489 Berlin",
    "distanceKm": 18.48
  },
  {
    "name": "Mittelpunktbibliothek Ehm Welk",
    "address": "Alte Hellersdorfer Str. 125, 12629 Berlin",
    "distanceKm": 18.816
  },
  {
    "name": "Bibliothek Karow",
    "address": "Achillesstraße 77, 13125 Berlin",
    "distanceKm": 18.858
  },
  {
    "name": "Stadtteilbibliothek Mahlsdorf",
    "address": "Alt-Mahlsdorf 24-26, 12623 Berlin",
    "distanceKm": 19.547
  },
  {
    "name": "Stadtteilbibliothek Heinrich von Kleist",
    "address": "Havemannstr. 17B, 12689 Berlin",
    "distanceKm": 19.825
  },
  {
    "name": "Mittelpunktbibliothek Köpenick Alter Markt",
    "address": "Alter Markt 2, 12555 Berlin",
    "distanceKm": 19.951
  },
  {
    "name": "Bibliothek Buch",
    "address": "Wiltbergstr. 19-23, 13125 Berlin-Buch",
    "distanceKm": 20.251
  },
  {
    "name": "Stadtteilbibliothek Altglienicke",
    "address": "Ortolfstr. 182-184, 12524 Berlin",
    "distanceKm": 20.572
  },
  {
    "name": "Fahrbibliothek Treptow-Köpenick",
    "address": "An Ihrer Haltestelle, 12555 Berlin",
    "distanceKm": 20.99
  },
  {
    "name": "Fahrbibliothek Treptow-Köpenick Kleiner Bus",
    "address": "An Ihrer Haltestelle, 12555 Berlin",
    "distanceKm": 20.99
  },
  {
    "name": "Stadtteilbibliothek Kaulsdorf - Nord",
    "address": "Neue Grottkauer Str. 5, 12619 Berlin",
    "distanceKm": 21.04
  },
  {
    "name": "Stadtteilbibliothek Kladow",
    "address": "Sakrower Landstraße 2, 14089 Berlin",
    "distanceKm": 22.871
  },
  {
    "name": "Stadtteilbibliothek Friedrichshagen",
    "address": "Peter-Hille-Str. 1, 12587 Berlin",
    "distanceKm": 23.498
  }
];
