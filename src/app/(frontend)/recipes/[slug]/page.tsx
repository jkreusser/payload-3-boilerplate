import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import Link from 'next/link'

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

  return (
    <article className="pt-16 pb-16">
      <div className="container">
        <h1 className="text-3xl font-semibold">{recipe.title}</h1>
        {(recipe as any).shortDescription && (
          <p className="mt-2 max-w-[48rem]">{(recipe as any).shortDescription}</p>
        )}
        <div className="text-sm opacity-75 mt-2">
          {Array.isArray((recipe as any).categories) && (recipe as any).categories.length > 0 && (
            <span>Kategorien: {(recipe as any).categories.join(', ')}</span>
          )}
          {(recipe as any).dietType && (
            <span className="ml-4">Ernährungsform: {(recipe as any).dietType}</span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-2">Zutaten</h2>
            <ul className="list-disc pl-6">
              {((recipe as any).ingredientsList || []).map((row: any, idx: number) => (
                <li key={idx}>
                  {row.quantity} {row.unit} {row.name}
                  {row.note ? `, ${row.note}` : ''}
                </li>
              ))}
            </ul>

            <h2 className="text-xl font-semibold mb-2 mt-8">Zubereitung</h2>
            <ol className="list-decimal pl-6 space-y-4">
              {(recipe as any).steps?.map((step: any, idx: number) => (
                <li key={idx}>
                  <div className="max-w-[48rem] whitespace-pre-wrap">{step.text}</div>
                  {typeof step.durationMinutes === 'number' && (
                    <div className="text-sm mt-1 opacity-80">Dauer: {step.durationMinutes} min</div>
                  )}
                </li>
              ))}
            </ol>
          </div>
          <aside>
            <div className="grid grid-cols-2 gap-4">
              {typeof recipe.prepTime === 'number' && (
                <div>
                  <div className="text-sm opacity-70">Vorbereitung</div>
                  <div className="text-lg font-medium">{recipe.prepTime} min</div>
                </div>
              )}
              {typeof recipe.cookTime === 'number' && (
                <div>
                  <div className="text-sm opacity-70">Kochen</div>
                  <div className="text-lg font-medium">{recipe.cookTime} min</div>
                </div>
              )}
              {typeof recipe.totalTime === 'number' && (
                <div>
                  <div className="text-sm opacity-70">Gesamt</div>
                  <div className="text-lg font-medium">{recipe.totalTime} min</div>
                </div>
              )}
              {typeof recipe.servings === 'number' && (
                <div>
                  <div className="text-sm opacity-70">Portionen</div>
                  <div className="text-lg font-medium">{recipe.servings}</div>
                </div>
              )}
            </div>
          </aside>
        </div>
        {/* Sekundärnavigation */}
        {related.docs?.length > 0 && (
          <div className="mt-16">
            <h3 className="text-xl font-semibold mb-4">Weitere Rezepte</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.docs.map((r: any, i: number) => (
                <div key={i} className="border rounded p-4">
                  <Link href={`/recipes/${r.slug}`} className="font-medium">{r.title}</Link>
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
