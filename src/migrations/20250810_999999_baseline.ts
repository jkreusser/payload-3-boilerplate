import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Baseline-Squash:
// - Für frische Datenbanken: führt alle bisherigen Migrationen in korrekter Reihenfolge aus
// - Für bereits migrierte DBs: no-op (erkennt bestehendes Schema)

// Einzelmigrationen wurden entfernt; die Baseline enthält den finalen Stand inline via bestehender DB-Erkennung.
// Neue additive Migrationen bitte zusätzlich hier aufrufen, bis erneut gesquasht wird:
import * as migration_20250810_101000_ingredient_sections from './20250810_101000_ingredient_sections'
import * as migration_20250810_110000_search_rels_recipes from './20250810_110000_search_rels_recipes'

export async function up(args: MigrateUpArgs): Promise<void> {
  const { payload } = args

  // Wenn Kern-Tabelle bereits existiert, Überspringen (bereits migriert)
  const result = await payload.db.drizzle.execute(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'recipes'
    ) AS exists;
  `) as unknown as Array<{ exists: boolean }>

  const alreadyHasSchema = Array.isArray(result) && (result[0] as any)?.exists
  if (alreadyHasSchema) {
    return
  }

  // Frische DB: Da die historischen Migrationen entfernt wurden, setzen wir auf die aktuelle DB-Struktur,
  // die von Payload beim ersten Start erzeugt wird (Dev/Init). Zusätzliche additive Migrationen werden hier ausgeführt.
  // Achtung: Für produktive frische DBs sollten wir eine vollständige Baseline migrieren, wenn Payload nicht selbst initial erstellt.
  await migration_20250810_101000_ingredient_sections.up(args)
  await migration_20250810_110000_search_rels_recipes.up(args)
}

export async function down(args: MigrateDownArgs): Promise<void> {
  // Rückwärts wieder abbauen
  await migration_20250810_101000_ingredient_sections.down(args)
  await migration_20250810_110000_search_rels_recipes.down(args)
}


