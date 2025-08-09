### Background and Motivation

Eine öffentlich zugängliche Kochrezept‑Website auf Basis des bestehenden Payload v3 + Next.js Boilerplates (Railway Deployment mit Postgres). Ziele:
- Inhalte komfortabel im Payload‑Admin pflegen (Rezepte, Zutaten, Kategorien)
- Nutzerfreundliche Darstellung mit Zutatenliste, Zubereitungsschritten, Bildern und Zeiten
- Gute Auffindbarkeit (SEO, OpenGraph, strukturierte Daten Schema.org Recipe)
- Performant (Static/ISR + Revalidate Hooks), such‑ und filterbar


### Key Challenges and Analysis

- Vereinfachtes Domänenmodell nach neuen Anforderungen:
  - Nur `Recipes` als Collection; keine separaten `Ingredients`
  - Zutaten/Schritte im Rezept (keine RichText‑Notwendigkeit)
  - Klassifizierung: `categories` (mehrfach), `dietType` (einfach), `tags` (frei, mit Vorschlagsliste)
  - Merkliste clientseitig, Sekundärnavigation, Suche/Filter
  - SEO/ISR bleiben wie gehabt

- Festgelegte Werte:
  - `categories` (Mehrfach‑Auswahl, Enum):
    Gutes mit Fleisch; Fisch & Meeresfrüchte; Bunte Gemüseküche; Für Veggies; Nudelgerichte; Reisgerichte; Suppenliebe; Leckere Salate; Süße Desserts; Asiatische Rezepte; Burger & Sandwiches; Gutes Frühstück; Schnelle Snacks; Saucen, Dips & Pesto; Eis Rezepte; Getränke; Schnelle Rezepte; Sommer Rezepte; Herbst Rezepte; Weihnachtsrezepte
  - `dietType` (Enum, eine Auswahl): Vegetarisch; Vegan; Laktosefrei; Glutenfrei
  - `unit` (Enum): g; kg; ml; l; TL; EL; Stück
  - `tags`: freie Strings, UI zeigt vorhandene Tags als Vorschläge (aus vorhandenen Rezepten aggregiert)
  - Sekundärnavigation: bevorzugt gleiche `categories`, sonst jüngste Rezepte; z.B. 6 Einträge
  - Merkliste: localStorage‑basiert; Client‑Seite `/favorites` liest IDs/Slugs aus localStorage und lädt Rezepte


### High-level Task Breakdown

0) Cleanup/Refactor: nur `Recipes` behalten
   - Drop `Ingredients` (Schema/Code), `Recipes` vereinfachen (Zutaten/Steps/Enums)

1) `Recipes` Schema final
   - Felder: title, slug, shortDescription, heroImage, metaTitle, metaDescription,
     ingredients[name, quantity, unit, note?], steps[text, image?, durationMinutes?],
     prepTime, cookTime, totalTime, servings,
     categories(enum[], Werte siehe oben), dietType(enum), tags(string[])

2) Frontend vereinfachen
   - `/recipes` Liste + Filter; `/recipes/[slug]` Detail + Sekundärnavigation

3) Merkliste
   - localStorage + Seite `/favorites`

4) Suche & Filter auf Home
   - Suchfeld + Filter (category, dietType, maxTotalTime)

5) SEO & JSON‑LD
   - Recipe JSON‑LD + generateMeta

6) Revalidate Hooks
   - für Rezepte und Listen

7) Migration & Seed
   - Migration anwenden, 5 Beispielrezepte


### Project Status Board

- OUTDATED: Alte Planung mit separater `Ingredients`‑Collection
- TODO: 0) Cleanup/Refactor `Recipes` only
- TODO: 1) `Recipes` Schema finalisieren (ohne RichText, mit Enums)
- TODO: 2) Frontend vereinfachen (Liste/Detail + Sekundärnavigation)
- TODO: 3) Merkliste (localStorage + `/favorites`)
- TODO: 4) Suche & Filter (Home + `/recipes`)
- TODO: 5) SEO & JSON‑LD
- TODO: 6) Revalidate Hooks
- TODO: 7) Migrationen & Seed
- DONE: Deployment‑Fix Railway Build (Import‑Map Mismatch) → `build` Script ergänzt um `payload generate:importmap`; fehlerhafte `LexicalDiffComponent`‑Referenz entfernt
 - DECIDED: categories enum[] + dietType enum + unit enum; tags frei mit Vorschlagsliste; Merkliste via localStorage; Sekundärnavigation bevorzugt gleiche Kategorien


### Executor's Feedback or Assistance Requests

- Entscheidungen festgelegt (keine weiteren Rückfragen nötig):
  - `categories`: Mehrfach‑Enum (Liste oben)
  - `dietType`: Enum (Vegetarisch, Vegan, Laktosefrei, Glutenfrei)
  - `unit`: Enum (g, kg, ml, l, TL, EL, Stück)
  - `tags`: freie Strings mit Vorschlagsliste
  - Sekundärnavigation: gleiche Kategorien bevorzugt, sonst neueste
  - Merkliste: localStorage (Client) als persistenter Speicher

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
 - Vereinfachtes Ein‑Collection‑Schema beschleunigt Implementierung und reduziert Pflege


