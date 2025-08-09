### Background and Motivation

Eine öffentlich zugängliche Kochrezept‑Website auf Basis des bestehenden Payload v3 + Next.js Boilerplates (Railway Deployment mit Postgres). Ziele:
- Inhalte komfortabel im Payload‑Admin pflegen (Rezepte, Zutaten, Kategorien)
- Nutzerfreundliche Darstellung mit Zutatenliste, Zubereitungsschritten, Bildern und Zeiten
- Gute Auffindbarkeit (SEO, OpenGraph, strukturierte Daten Schema.org Recipe)
- Performant (Static/ISR + Revalidate Hooks), such‑ und filterbar


### Key Challenges and Analysis

- Domänenmodellierung:
  - Collections: `Recipes`, `Ingredients`, `Categories`, optionale `Tags`, optionale `Units` (oder Enum‑Feld)
  - Felder für Rezept: Titel, Slug, Beschreibung/Intro, Hero‑Bild, Zutaten (Relation + Menge + Einheit), Schritte (RichText/Blocks mit Zeit/Foto), Zeiten (Vorbereitung, Kochen, Gesamt), Portionen, Schwierigkeitsgrad, Nährwerte
- Editor‑UX:
  - Blöcke/Struktur für Zubereitungsschritte, evtl. Timer/Duration pro Schritt
  - Wiederverwendbare Zutaten + Mengen/Einheiten, Validierungen
- Frontend:
  - Routen: `/recipes`, `/recipes/[slug]`, Filter/Facetten (Kategorie, Zutat)
  - SSR/SSG mit Revalidate Hooks; Pagination, Suchseite
- Suche/Filter:
  - Start mit einfacher textbasierter Suche (vorhandene `src/search`-Integration nutzen) + Filter über Query
- SEO/Sharing:
  - `generateMeta` nutzen; JSON‑LD für Recipe, OpenGraph, sprechende Slugs
- Media & Performance:
  - Bestehende `Media` Collection verwenden; Bildgrößen/Responsive; Caching
- Migration/Seed/Deployment:
  - Migrations für neue Collections; Seed‑Endpunkt nutzen (`/next/seed`) für Demo‑Rezepte
  - Railway ENV Variablen für Payload/Next/DB
- Berechtigungen:
  - Public Read für veröffentlichte Rezepte; Admin‑Only für Schreiben


### High-level Task Breakdown

1) Datenmodell anlegen (Payload Collections)
   - Erfolgskriterien:
     - `Recipes`, `Ingredients`, `Categories` existieren inkl. Feldern und Valids
     - Rezepte im Admin erstellen/validieren möglich

2) Zutatenmodellierung vervollständigen
   - Umsetzung: Zutaten‑Array mit Relationen (`ingredient`), `quantity:number`, `unit:enum` (z.B. g, ml, TL, EL, Stück)
   - Erfolgskriterien:
     - Mind. ein Rezept mit mehreren Zutaten inkl. Menge/Einheit speicherbar

3) Zubereitungsschritte als strukturierte Blöcke
   - Umsetzung: Block/Array mit Feldern: Beschreibung (RichText), optionale Dauer (Minuten), optionales Bild
   - Erfolgskriterien:
     - Schritte im Admin erfassbar; Reihenfolge änderbar

4) Zeiten/Portionen/Nährwerte
   - Felder: `prepTime`, `cookTime`, `totalTime` (berechnet oder manuell), `servings`, optional `nutrition` (kcal, Protein …)
   - Erfolgskriterien:
     - Felder vorhanden, validiert, im Admin sichtbar

5) Frontend‑Routen
   - Seiten: `/recipes` (Liste + Pagination + Filter), `/recipes/[slug]` (Detail)
   - Erfolgskriterien:
     - Liste rendert veröffentlichte Rezepte mit Bild/Titel/Kategorie
     - Detailseite zeigt Zutaten, Schritte, Zeiten, SEO‑Meta

6) Suche & Filter
   - Start: einfache Volltextsuche (bestehende `src/search` nutzen) + Filter (Kategorie, Zutat)
   - Erfolgskriterien:
     - Suchseite liefert passende Ergebnisse; Filter kombinierbar

7) SEO & strukturierte Daten
   - JSON‑LD `Recipe` auf Detailseite; OpenGraph/Twitter Cards; `generateMeta` verwenden
   - Erfolgskriterien:
     - Lighthouse/Testing Tool erkennt `Recipe` Schema ohne Fehler

8) Revalidate Hooks
   - Hooks analog `Posts/Pages`: bei Create/Update/Delete von `Recipes` Revalidate der relevanten Seiten
   - Erfolgskriterien:
     - Änderung im Admin wird nach kurzer Zeit auf Frontend sichtbar (ohne manuellen Neustart)

9) Migrationen & Seed
   - Migrations für Collections; Seed‑Endpunkt mit Beispiel‑Zutaten/‑Rezepten
   - Erfolgskriterien:
     - `pnpm build`/start funktioniert mit frischer DB; Seed erzeugt min. 3 Beispielrezepte

10) Deployment & ENV
   - Railway: ENV Variablen für Payload, Next, DB; Migrations im CI/CD ausführen
   - Erfolgskriterien:
     - Production‑Build erfolgreich, Seiten erreichbar, Admin nutzbar

11) Optional: Bewertungen/Kommentare
   - Einfache Sternebewertung oder Kommentar‑Collection (moderiert)
   - Erfolgskriterien:
     - Nutzer kann bewerten/kommentieren; Admin kann moderieren


### Project Status Board

- TODO: 1) Datenmodell anlegen (`Recipes`, `Ingredients`, `Categories`)
  - IN PROGRESS: Collections `Ingredients`, `Recipes` angelegt; Revalidate‑Hook hinzugefügt; in `payload.config.ts` registriert; Types generiert
- TODO: 2) Zutatenmodellierung (Menge/Einheit) finalisieren
- TODO: 3) Zubereitungsschritte als Blöcke umsetzen
- TODO: 4) Zeiten/Portionen/Nährwerte Felder hinzufügen
- TODO: 5) Frontend Routen `/recipes`, `/recipes/[slug]`
  - IN PROGRESS: Grundseiten für Rezepte (Liste & Detail) erstellt; einfache Ausgabe der RichText‑Steps
- TODO: 6) Suche & Filter (Kategorie, Zutat)
- TODO: 7) SEO & JSON‑LD (Recipe)
- TODO: 8) Revalidate Hooks für `Recipes`
- TODO: 9) Migrationen & Seed‑Daten
- TODO: 10) Deployment/ENV auf Railway finalisieren
- OPTIONAL: 11) Bewertungen/Kommentare
 - DONE: Deployment‑Fix Railway Build (Import‑Map Mismatch) → `build` Script ergänzt um `payload generate:importmap`; fehlerhafte `LexicalDiffComponent`‑Referenz entfernt


### Executor's Feedback or Assistance Requests

- Offene Entscheidungen:
  - Einheiten als feste Enum‑Liste vs. separate `Units`‑Collection?
  - Benötigen wir `Tags` zusätzlich zu `Categories`?
  - Sollen Bewertungen/Kommentare direkt in Phase 1 oder später?
  - Mehrsprachigkeit jetzt oder später?

- Technische Hinweise:
  - Bei Vulnerabilities im CI: `npm audit` ausführen
  - Keine `git --force` ohne explizite Freigabe


### Lessons

- Vor Editieren stets Dateien lesen; kleine, testbare Schritte
- Debug‑freundliche Fehlermeldungen in API/Serverausgabe
- Revalidate‑Strategie früh klären, um Caching‑Probleme zu vermeiden
- Schema.org früh testen, um späte SEO‑Fixes zu vermeiden
 - Import‑Map muss zu installierten Paketen passen → Schritt `payload generate:importmap` in CI/Build aufnehmen
 - „latest“‑Abhängigkeiten können Breaking Changes bringen → ggf. Versionen pinnen, wenn erneut Inkompatibilitäten auftreten


