import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
   CREATE TYPE "public"."enum_recipes_ingredients_list_unit" AS ENUM('g', 'kg', 'ml', 'l', 'TL', 'EL', 'stueck');
  CREATE TYPE "public"."enum_recipes_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__recipes_v_version_ingredients_list_unit" AS ENUM('g', 'kg', 'ml', 'l', 'TL', 'EL', 'stueck');
  CREATE TYPE "public"."enum__recipes_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE IF NOT EXISTS "ingredients" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "recipes_ingredients_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"ingredient_id" integer,
  	"quantity" numeric,
  	"unit" "enum_recipes_ingredients_list_unit",
  	"note" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "recipes_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"duration_minutes" numeric,
  	"image_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "recipes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro" varchar,
  	"hero_image_id" integer,
  	"servings" numeric DEFAULT 2,
  	"prep_time" numeric,
  	"cook_time" numeric,
  	"total_time" numeric,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_recipes_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "recipes_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "_recipes_v_version_ingredients_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"ingredient_id" integer,
  	"quantity" numeric,
  	"unit" "enum__recipes_v_version_ingredients_list_unit",
  	"note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_recipes_v_version_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"duration_minutes" numeric,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_recipes_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_intro" varchar,
  	"version_hero_image_id" integer,
  	"version_servings" numeric DEFAULT 2,
  	"version_prep_time" numeric,
  	"version_cook_time" numeric,
  	"version_total_time" numeric,
  	"version_slug" varchar,
  	"version_slug_lock" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__recipes_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "_recipes_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "ingredients_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "recipes_id" integer;
  DO $$ BEGIN
   ALTER TABLE "recipes_ingredients_list" ADD CONSTRAINT "recipes_ingredients_list_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "recipes_ingredients_list" ADD CONSTRAINT "recipes_ingredients_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "recipes_steps" ADD CONSTRAINT "recipes_steps_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "recipes_steps" ADD CONSTRAINT "recipes_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "recipes" ADD CONSTRAINT "recipes_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
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
   ALTER TABLE "_recipes_v_version_ingredients_list" ADD CONSTRAINT "_recipes_v_version_ingredients_list_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_recipes_v_version_ingredients_list" ADD CONSTRAINT "_recipes_v_version_ingredients_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_recipes_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_recipes_v_version_steps" ADD CONSTRAINT "_recipes_v_version_steps_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_recipes_v_version_steps" ADD CONSTRAINT "_recipes_v_version_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_recipes_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_recipes_v" ADD CONSTRAINT "_recipes_v_parent_id_recipes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."recipes"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_recipes_v" ADD CONSTRAINT "_recipes_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
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
  CREATE INDEX IF NOT EXISTS "recipes_ingredients_list_order_idx" ON "recipes_ingredients_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "recipes_ingredients_list_parent_id_idx" ON "recipes_ingredients_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "recipes_ingredients_list_ingredient_idx" ON "recipes_ingredients_list" USING btree ("ingredient_id");
  CREATE INDEX IF NOT EXISTS "recipes_steps_order_idx" ON "recipes_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "recipes_steps_parent_id_idx" ON "recipes_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "recipes_steps_image_idx" ON "recipes_steps" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "recipes_hero_image_idx" ON "recipes" USING btree ("hero_image_id");
  CREATE INDEX IF NOT EXISTS "recipes_slug_idx" ON "recipes" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "recipes_updated_at_idx" ON "recipes" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "recipes_created_at_idx" ON "recipes" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "recipes__status_idx" ON "recipes" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "recipes_rels_order_idx" ON "recipes_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "recipes_rels_parent_idx" ON "recipes_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "recipes_rels_path_idx" ON "recipes_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "recipes_rels_categories_id_idx" ON "recipes_rels" USING btree ("categories_id");
  CREATE INDEX IF NOT EXISTS "_recipes_v_version_ingredients_list_order_idx" ON "_recipes_v_version_ingredients_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_recipes_v_version_ingredients_list_parent_id_idx" ON "_recipes_v_version_ingredients_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_recipes_v_version_ingredients_list_ingredient_idx" ON "_recipes_v_version_ingredients_list" USING btree ("ingredient_id");
  CREATE INDEX IF NOT EXISTS "_recipes_v_version_steps_order_idx" ON "_recipes_v_version_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_recipes_v_version_steps_parent_id_idx" ON "_recipes_v_version_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_recipes_v_version_steps_image_idx" ON "_recipes_v_version_steps" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "_recipes_v_parent_idx" ON "_recipes_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_recipes_v_version_version_hero_image_idx" ON "_recipes_v" USING btree ("version_hero_image_id");
  CREATE INDEX IF NOT EXISTS "_recipes_v_version_version_slug_idx" ON "_recipes_v" USING btree ("version_slug");
  CREATE INDEX IF NOT EXISTS "_recipes_v_version_version_updated_at_idx" ON "_recipes_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_recipes_v_version_version_created_at_idx" ON "_recipes_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_recipes_v_version_version__status_idx" ON "_recipes_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_recipes_v_created_at_idx" ON "_recipes_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_recipes_v_updated_at_idx" ON "_recipes_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_recipes_v_latest_idx" ON "_recipes_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_recipes_v_rels_order_idx" ON "_recipes_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_recipes_v_rels_parent_idx" ON "_recipes_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_recipes_v_rels_path_idx" ON "_recipes_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_recipes_v_rels_categories_id_idx" ON "_recipes_v_rels" USING btree ("categories_id");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ingredients_fk" FOREIGN KEY ("ingredients_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_recipes_fk" FOREIGN KEY ("recipes_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_ingredients_id_idx" ON "payload_locked_documents_rels" USING btree ("ingredients_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_recipes_id_idx" ON "payload_locked_documents_rels" USING btree ("recipes_id");`)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
   ALTER TABLE "ingredients" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "recipes_ingredients_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "recipes_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "recipes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "recipes_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_recipes_v_version_ingredients_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_recipes_v_version_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_recipes_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_recipes_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "ingredients" CASCADE;
  DROP TABLE "recipes_ingredients_list" CASCADE;
  DROP TABLE "recipes_steps" CASCADE;
  DROP TABLE "recipes" CASCADE;
  DROP TABLE "recipes_rels" CASCADE;
  DROP TABLE "_recipes_v_version_ingredients_list" CASCADE;
  DROP TABLE "_recipes_v_version_steps" CASCADE;
  DROP TABLE "_recipes_v" CASCADE;
  DROP TABLE "_recipes_v_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_ingredients_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_recipes_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_ingredients_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_recipes_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "ingredients_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "recipes_id";
  DROP TYPE "public"."enum_recipes_ingredients_list_unit";
  DROP TYPE "public"."enum_recipes_status";
  DROP TYPE "public"."enum__recipes_v_version_ingredients_list_unit";
  DROP TYPE "public"."enum__recipes_v_version_status";`)
}
