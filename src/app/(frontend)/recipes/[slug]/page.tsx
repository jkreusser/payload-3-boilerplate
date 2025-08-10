import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import Link from 'next/link'
import {
  ChefHat,
  Clock,
  Flame,
  Hourglass,
  Users as UsersIcon,
  Utensils,
  ListChecks,
} from 'lucide-react'
import { Media } from '@/components/Media'
import { IngredientsScaler } from './page.client'

type Args = {
  params: Promise<{ slug?: string }>
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const recipes = await payload.find({
    collection: 'recipes',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    select: { slug: true },
  })
  return recipes.docs.map(({ slug }) => ({ slug }))
}

export default async function RecipePage({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const recipe = await queryRecipeBySlug({ slug })
  if (!recipe) return null

  const payload = await getPayload({ config: configPromise })
  const related = await payload.find({
    collection: 'recipes',
    limit: 6,
    pagination: false,
    where: {
      and: [
        { slug: { not_equals: slug } },
        { categories: { contains: (recipe as any).categories?.[0] || '' } },
      ],
    },
  })

  // Client-Komponente rendert Portions-Steuerung + skalierte Zutaten

  return (
    <article className="pt-16 pb-16">
      <div className="container">
        <h1 className="text-3xl font-semibold tracking-tight">{recipe.title}</h1>

        {(recipe as any).shortDescription && (
          <p className="mt-4 text-base opacity-90 max-w-[48rem]">
            {(recipe as any).shortDescription}
          </p>
        )}
        <div className="text-sm opacity-80 mt-4 flex flex-wrap gap-2">
          {Array.isArray((recipe as any).categories) && (recipe as any).categories.length > 0 && (
            <div className="flex items-center gap-2">
              <ChefHat className="h-4 w-4" />
              <div className="flex flex-wrap gap-1">
                {(recipe as any).categories.map((c: string, i: number) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
          {Array.isArray((recipe as any).dietType) && (recipe as any).dietType.length > 0 && (
            <div className="flex items-center gap-2 ml-2">
              <UsersIcon className="h-4 w-4" />
              <div className="flex flex-wrap gap-1">
                {(recipe as any).dietType.map((d: string, i: number) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        {recipe.heroImage && typeof recipe.heroImage !== 'string' && (
          <div className="mt-6 relative aspect-[4/3] rounded-lg overflow-hidden">
            <Media resource={recipe.heroImage as any} fill imgClassName="object-cover" />
          </div>
        )}
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {typeof recipe.prepTime === 'number' && (
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Hourglass className="h-5 w-5" />
              <div>
                <div className="text-xs opacity-70">Vorbereitung</div>
                <div className="text-base font-medium">{recipe.prepTime} min</div>
              </div>
            </div>
          )}
          {typeof recipe.cookTime === 'number' && (
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Flame className="h-5 w-5" />
              <div>
                <div className="text-xs opacity-70">Kochen</div>
                <div className="text-base font-medium">{recipe.cookTime} min</div>
              </div>
            </div>
          )}
          {typeof recipe.totalTime === 'number' && (
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Clock className="h-5 w-5" />
              <div>
                <div className="text-xs opacity-70">Gesamt</div>
                <div className="text-base font-medium">{recipe.totalTime} min</div>
              </div>
            </div>
          )}
          {typeof recipe.servings === 'number' && (
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <UsersIcon className="h-5 w-5" />
              <div>
                <div className="text-xs opacity-70">Portionen</div>
                <div className="text-base font-medium">{recipe.servings}</div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Utensils className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Zutaten</h2>
            </div>
            <IngredientsScaler
              slug={slug}
              baseServings={(recipe as any).servings || 1}
              ingredients={(recipe as any).ingredientsList || []}
            />

            <div className="flex items-center gap-2 mt-10 mb-3">
              <ListChecks className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Zubereitung</h2>
            </div>
            <ol className="space-y-5">
              {(recipe as any).steps?.map((step: any, idx: number) => (
                <li key={idx} className="flex gap-3">
                  <div className="mt-0.5 h-6 w-6 shrink-0 grid place-items-center rounded-full border text-xs font-medium">
                    {idx + 1}
                  </div>
                  <div className="max-w-[48rem] whitespace-pre-wrap">{step.text}</div>
                  {/* Dauer entfernt */}
                </li>
              ))}
            </ol>
          </div>
        </div>
        {/* Sekundärnavigation */}
        {related.docs?.length > 0 && (
          <div className="mt-16">
            <h3 className="text-xl font-semibold mb-4">Weitere Rezepte</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.docs.map((r: any, i: number) => (
                <div key={i} className="border rounded p-4">
                  <Link href={`/recipes/${r.slug}`} className="font-medium">
                    {r.title}
                  </Link>
                  {r.shortDescription && (
                    <p className="text-sm opacity-80 mt-2 line-clamp-3">{r.shortDescription}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const recipe = await queryRecipeBySlug({ slug })
  return {
    title: (recipe as any)?.metaTitle || recipe?.title || 'Rezept',
    description: (recipe as any)?.metaDescription,
  }
}

const queryRecipeBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'recipes',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: { slug: { equals: slug } },
  })
  return result.docs?.[0] || null
})
