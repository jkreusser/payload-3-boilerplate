import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Baseline-Squash:
// - Für frische Datenbanken: führt alle bisherigen Migrationen in korrekter Reihenfolge aus
// - Für bereits migrierte DBs: no-op (erkennt bestehendes Schema)

import * as migration_20241125_222020_initial from './20241125_222020_initial'
import * as migration_20241214_124128 from './20241214_124128'
import * as migration_20250809_215300 from './20250809_215300'
import * as migration_20250809_223517 from './20250809_223517'
import * as migration_20250809_231537 from './20250809_231537'
import * as migration_20250810_000001 from './20250810_000001'

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

  // Frische DB: führe alle bisherigen Migrationen in Reihenfolge aus
  await migration_20241125_222020_initial.up(args)
  await migration_20241214_124128.up(args)
  await migration_20250809_215300.up(args)
  await migration_20250809_223517.up(args)
  await migration_20250809_231537.up(args)
  await migration_20250810_000001.up(args)
}

export async function down(args: MigrateDownArgs): Promise<void> {
  // Rückwärts wieder abbauen
  await migration_20250810_000001.down(args)
  await migration_20250809_231537.down(args)
  await migration_20250809_223517.down(args)
  await migration_20250809_215300.down(args)
  await migration_20241214_124128.down(args)
  await migration_20241125_222020_initial.down(args)
}


