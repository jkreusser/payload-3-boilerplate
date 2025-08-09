import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

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

  return (
    <article className="pt-16 pb-16">
      <div className="container">
        <h1 className="text-3xl font-semibold">{recipe.title}</h1>
        {recipe.intro && <p className="mt-2 max-w-[48rem]">{recipe.intro}</p>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-2">Zutaten</h2>
            <ul className="list-disc pl-6">
              {(recipe.ingredientsList || []).map((row: any, idx: number) => {
                const title = typeof row.ingredient === 'object' ? row.ingredient.title : ''
                return (
                  <li key={idx}>
                    {row.quantity} {row.unit} {title}
                    {row.note ? `, ${row.note}` : ''}
                  </li>
                )
              })}
            </ul>

            <h2 className="text-xl font-semibold mb-2 mt-8">Zubereitung</h2>
            <ol className="list-decimal pl-6 space-y-4">
              {(recipe.steps || []).map((step: any, idx: number) => (
                <li key={idx}>
                  <div className="prose dark:prose-invert max-w-none">
                    {/* content ist RichText JSON; einfache Ausgabe */}
                    <pre className="whitespace-pre-wrap text-sm opacity-80">
                      {JSON.stringify(step.content)}
                    </pre>
                  </div>
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
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const recipe = await queryRecipeBySlug({ slug })
  return { title: recipe?.title || 'Rezept' }
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
