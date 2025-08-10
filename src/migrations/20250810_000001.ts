import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Fix dietType schema: switch from single enum column to hasMany join tables
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    -- Create join table for recipes.dietType (hasMany)
    CREATE TABLE IF NOT EXISTS "recipes_diet_type" (
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL,
      "value" "enum_recipes_diet_type",
      "id" serial PRIMARY KEY NOT NULL
    );

    -- Create join table for versions
    CREATE TABLE IF NOT EXISTS "_recipes_v_version_diet_type" (
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL,
      "value" "enum__recipes_v_version_diet_type",
      "id" serial PRIMARY KEY NOT NULL
    );

    DO $$ BEGIN
      ALTER TABLE "recipes_diet_type" ADD CONSTRAINT "recipes_diet_type_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      ALTER TABLE "_recipes_v_version_diet_type" ADD CONSTRAINT "_recipes_v_version_diet_type_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_recipes_v"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE INDEX IF NOT EXISTS "recipes_diet_type_order_idx" ON "recipes_diet_type" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "recipes_diet_type_parent_idx" ON "recipes_diet_type" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "_recipes_v_version_diet_type_order_idx" ON "_recipes_v_version_diet_type" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "_recipes_v_version_diet_type_parent_idx" ON "_recipes_v_version_diet_type" USING btree ("parent_id");
  `)

  // Migrate existing single-value data (if columns exist) into the new join tables, then drop columns
  await payload.db.drizzle.execute(sql`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'diet_type'
      ) THEN
        INSERT INTO "recipes_diet_type" ("order", "parent_id", "value")
        SELECT 0, r."id", r."diet_type" FROM "recipes" r WHERE r."diet_type" IS NOT NULL;

        ALTER TABLE "recipes" DROP COLUMN IF EXISTS "diet_type";
      END IF;
    END $$;

    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = '_recipes_v' AND column_name = 'version_diet_type'
      ) THEN
        INSERT INTO "_recipes_v_version_diet_type" ("order", "parent_id", "value")
        SELECT 0, v."id", v."version_diet_type" FROM "_recipes_v" v WHERE v."version_diet_type" IS NOT NULL;

        ALTER TABLE "_recipes_v" DROP COLUMN IF EXISTS "version_diet_type";
      END IF;
    END $$;
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  // Recreate single columns and migrate back one representative value per recipe/version
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "recipes" ADD COLUMN IF NOT EXISTS "diet_type" "enum_recipes_diet_type";
    ALTER TABLE "_recipes_v" ADD COLUMN IF NOT EXISTS "version_diet_type" "enum__recipes_v_version_diet_type";

    -- Backfill from join tables (first by order)
    UPDATE "recipes" r SET "diet_type" = sub."value"
    FROM (
      SELECT DISTINCT ON ("parent_id") "parent_id", "value"
      FROM "recipes_diet_type"
      ORDER BY "parent_id", "order" ASC, "id" ASC
    ) sub
    WHERE r."id" = sub."parent_id";

    UPDATE "_recipes_v" v SET "version_diet_type" = sub."value"
    FROM (
      SELECT DISTINCT ON ("parent_id") "parent_id", "value"
      FROM "_recipes_v_version_diet_type"
      ORDER BY "parent_id", "order" ASC, "id" ASC
    ) sub
    WHERE v."id" = sub."parent_id";

    DROP TABLE IF EXISTS "recipes_diet_type" CASCADE;
    DROP TABLE IF EXISTS "_recipes_v_version_diet_type" CASCADE;
  `)
}


