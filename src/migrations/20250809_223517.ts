import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
   CREATE TYPE "public"."enum_recipes_categories" AS ENUM('Gutes mit Fleisch', 'Fisch & Meeresfrüchte', 'Bunte Gemüseküche', 'Für Veggies', 'Nudelgerichte', 'Reisgerichte', 'Suppenliebe', 'Leckere Salate', 'Süße Desserts', 'Asiatische Rezepte', 'Burger & Sandwiches', 'Gutes Frühstück', 'Schnelle Snacks', 'Saucen, Dips & Pesto', 'Eis Rezepte', 'Getränke', 'Schnelle Rezepte', 'Sommer Rezepte', 'Herbst Rezepte', 'Weihnachtsrezepte');
  CREATE TYPE "public"."enum_recipes_diet_type" AS ENUM('Vegetarisch', 'Vegan', 'Laktosefrei', 'Glutenfrei');
  CREATE TYPE "public"."enum__recipes_v_version_categories" AS ENUM('Gutes mit Fleisch', 'Fisch & Meeresfrüchte', 'Bunte Gemüseküche', 'Für Veggies', 'Nudelgerichte', 'Reisgerichte', 'Suppenliebe', 'Leckere Salate', 'Süße Desserts', 'Asiatische Rezepte', 'Burger & Sandwiches', 'Gutes Frühstück', 'Schnelle Snacks', 'Saucen, Dips & Pesto', 'Eis Rezepte', 'Getränke', 'Schnelle Rezepte', 'Sommer Rezepte', 'Herbst Rezepte', 'Weihnachtsrezepte');
  CREATE TYPE "public"."enum__recipes_v_version_diet_type" AS ENUM('Vegetarisch', 'Vegan', 'Laktosefrei', 'Glutenfrei');
  CREATE TABLE IF NOT EXISTS "recipes_categories" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_recipes_categories",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "recipes_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_recipes_v_version_categories" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__recipes_v_version_categories",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "_recipes_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "ingredients" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "recipes_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_recipes_v_rels" DISABLE ROW LEVEL SECURITY;
  -- Falls vorhanden: Constraints zuerst entfernen (bei frischer DB evtl. bereits entfernt durch CASCADE)
  ALTER TABLE "recipes_ingredients_list" DROP CONSTRAINT IF EXISTS "recipes_ingredients_list_ingredient_id_ingredients_id_fk";
  ALTER TABLE "_recipes_v_version_ingredients_list" DROP CONSTRAINT IF EXISTS "_recipes_v_version_ingredients_list_ingredient_id_ingredients_id_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_ingredients_fk";
  -- Tabellen entfernen (falls vorhanden)
  DROP TABLE IF EXISTS "ingredients" CASCADE;
  DROP TABLE IF EXISTS "recipes_rels" CASCADE;
  DROP TABLE IF EXISTS "_recipes_v_rels" CASCADE;
  
  DROP INDEX IF EXISTS "recipes_ingredients_list_ingredient_idx";
  DROP INDEX IF EXISTS "_recipes_v_version_ingredients_list_ingredient_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_ingredients_id_idx";
  ALTER TABLE "recipes_ingredients_list" ADD COLUMN "name" varchar;
  ALTER TABLE "recipes_steps" ADD COLUMN "text" varchar;
  ALTER TABLE "recipes" ADD COLUMN "short_description" varchar;
  ALTER TABLE "recipes" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "recipes" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "recipes" ADD COLUMN "diet_type" "enum_recipes_diet_type";
  ALTER TABLE "_recipes_v_version_ingredients_list" ADD COLUMN "name" varchar;
  ALTER TABLE "_recipes_v_version_steps" ADD COLUMN "text" varchar;
  ALTER TABLE "_recipes_v" ADD COLUMN "version_short_description" varchar;
  ALTER TABLE "_recipes_v" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_recipes_v" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "_recipes_v" ADD COLUMN "version_diet_type" "enum__recipes_v_version_diet_type";
  DO $$ BEGIN
   ALTER TABLE "recipes_categories" ADD CONSTRAINT "recipes_categories_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "recipes_tags" ADD CONSTRAINT "recipes_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_recipes_v_version_categories" ADD CONSTRAINT "_recipes_v_version_categories_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_recipes_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_recipes_v_version_tags" ADD CONSTRAINT "_recipes_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_recipes_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "recipes_categories_order_idx" ON "recipes_categories" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "recipes_categories_parent_idx" ON "recipes_categories" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "recipes_tags_order_idx" ON "recipes_tags" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "recipes_tags_parent_id_idx" ON "recipes_tags" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_recipes_v_version_categories_order_idx" ON "_recipes_v_version_categories" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_recipes_v_version_categories_parent_idx" ON "_recipes_v_version_categories" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_recipes_v_version_tags_order_idx" ON "_recipes_v_version_tags" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_recipes_v_version_tags_parent_id_idx" ON "_recipes_v_version_tags" USING btree ("_parent_id");
  ALTER TABLE "recipes_ingredients_list" DROP COLUMN IF EXISTS "ingredient_id";
  ALTER TABLE "recipes_steps" DROP COLUMN IF EXISTS "content";
  ALTER TABLE "recipes" DROP COLUMN IF EXISTS "intro";
  ALTER TABLE "_recipes_v_version_ingredients_list" DROP COLUMN IF EXISTS "ingredient_id";
  ALTER TABLE "_recipes_v_version_steps" DROP COLUMN IF EXISTS "content";
  ALTER TABLE "_recipes_v" DROP COLUMN IF EXISTS "version_intro";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "ingredients_id";`)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
   CREATE TABLE IF NOT EXISTS "ingredients" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "recipes_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "_recipes_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  ALTER TABLE "recipes_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "recipes_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_recipes_v_version_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_recipes_v_version_tags" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "recipes_categories" CASCADE;
  DROP TABLE "recipes_tags" CASCADE;
  DROP TABLE "_recipes_v_version_categories" CASCADE;
  DROP TABLE "_recipes_v_version_tags" CASCADE;
  ALTER TABLE "recipes_ingredients_list" ADD COLUMN "ingredient_id" integer;
  ALTER TABLE "recipes_steps" ADD COLUMN "content" jsonb;
  ALTER TABLE "recipes" ADD COLUMN "intro" varchar;
  ALTER TABLE "_recipes_v_version_ingredients_list" ADD COLUMN "ingredient_id" integer;
  ALTER TABLE "_recipes_v_version_steps" ADD COLUMN "content" jsonb;
  ALTER TABLE "_recipes_v" ADD COLUMN "version_intro" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "ingredients_id" integer;
  DO $$ BEGIN
   ALTER TABLE "recipes_rels" ADD CONSTRAINT "recipes_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "recipes_rels" ADD CONSTRAINT "recipes_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_recipes_v_rels" ADD CONSTRAINT "_recipes_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_recipes_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_recipes_v_rels" ADD CONSTRAINT "_recipes_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "ingredients_updated_at_idx" ON "ingredients" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "ingredients_created_at_idx" ON "ingredients" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "recipes_rels_order_idx" ON "recipes_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "recipes_rels_parent_idx" ON "recipes_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "recipes_rels_path_idx" ON "recipes_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "recipes_rels_categories_id_idx" ON "recipes_rels" USING btree ("categories_id");
  CREATE INDEX IF NOT EXISTS "_recipes_v_rels_order_idx" ON "_recipes_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_recipes_v_rels_parent_idx" ON "_recipes_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_recipes_v_rels_path_idx" ON "_recipes_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_recipes_v_rels_categories_id_idx" ON "_recipes_v_rels" USING btree ("categories_id");
  DO $$ BEGIN
   ALTER TABLE "recipes_ingredients_list" ADD CONSTRAINT "recipes_ingredients_list_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_recipes_v_version_ingredients_list" ADD CONSTRAINT "_recipes_v_version_ingredients_list_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ingredients_fk" FOREIGN KEY ("ingredients_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "recipes_ingredients_list_ingredient_idx" ON "recipes_ingredients_list" USING btree ("ingredient_id");
  CREATE INDEX IF NOT EXISTS "_recipes_v_version_ingredients_list_ingredient_idx" ON "_recipes_v_version_ingredients_list" USING btree ("ingredient_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_ingredients_id_idx" ON "payload_locked_documents_rels" USING btree ("ingredients_id");
  ALTER TABLE "recipes_ingredients_list" DROP COLUMN IF EXISTS "name";
  ALTER TABLE "recipes_steps" DROP COLUMN IF EXISTS "text";
  ALTER TABLE "recipes" DROP COLUMN IF EXISTS "short_description";
  ALTER TABLE "recipes" DROP COLUMN IF EXISTS "meta_title";
  ALTER TABLE "recipes" DROP COLUMN IF EXISTS "meta_description";
  ALTER TABLE "recipes" DROP COLUMN IF EXISTS "diet_type";
  ALTER TABLE "_recipes_v_version_ingredients_list" DROP COLUMN IF EXISTS "name";
  ALTER TABLE "_recipes_v_version_steps" DROP COLUMN IF EXISTS "text";
  ALTER TABLE "_recipes_v" DROP COLUMN IF EXISTS "version_short_description";
  ALTER TABLE "_recipes_v" DROP COLUMN IF EXISTS "version_meta_title";
  ALTER TABLE "_recipes_v" DROP COLUMN IF EXISTS "version_meta_description";
  ALTER TABLE "_recipes_v" DROP COLUMN IF EXISTS "version_diet_type";
  DROP TYPE "public"."enum_recipes_categories";
  DROP TYPE "public"."enum_recipes_diet_type";
  DROP TYPE "public"."enum__recipes_v_version_categories";
  DROP TYPE "public"."enum__recipes_v_version_diet_type";`)
}
