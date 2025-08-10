import type { Metadata } from 'next/types'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Filters } from './recipes/Filters.client'
import { RECIPE_CATEGORIES, RECIPE_DIET_TYPES } from '@/collections/Recipes'
import { Media } from '@/components/Media'
import { RecipeCard } from '@/components/RecipeCard'
import FavoriteHeart from '@/components/FavoriteHeart/Heart.client'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { q?: string; category?: string; diet?: string | string[]; max?: string }
}) {
  const payload = await getPayload({ config: configPromise })

  const where: any = {}
  if (searchParams?.q)
    where.or = [{ title: { like: searchParams.q } }, { shortDescription: { like: searchParams.q } }]
  if (searchParams?.category) where.categories = { contains: searchParams.category }
  if (searchParams?.diet) {
    const diets = Array.isArray(searchParams.diet) ? searchParams.diet : [searchParams.diet]
    where.dietType = { in: diets }
  }
  if (searchParams?.max) where.totalTime = { less_than_equal: Number(searchParams.max) }

  const recipes = await payload.find({
    collection: 'recipes',
    depth: 1,
    limit: 24,
    overrideAccess: false,
    where,
    select: {
      title: true,
      slug: true,
      categories: true,
      shortDescription: true,
      totalTime: true,
      dietType: true,
      heroImage: true,
    },
  })

  return (
    <div className="pt-24 pb-24">
      <div className="container mb-8">
        <h1 className="text-3xl font-semibold">Kochrezepte</h1>
        <p className="opacity-80">Suche und filtere nach Rezepten</p>
      </div>

      <Filters categories={RECIPE_CATEGORIES} dietTypes={RECIPE_DIET_TYPES} multiDiet={false} />

      <div className="container">
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
          {recipes.docs.map((recipe, idx) => (
            <div key={idx} className="col-span-4">
              <RecipeCard
                slug={recipe.slug || ''}
                title={recipe.title}
                description={recipe.shortDescription}
                image={recipe.heroImage as any}
                category={
                  Array.isArray(recipe.categories) && recipe.categories.length > 0
                    ? recipe.categories[0]
                    : undefined
                }
                totalTime={typeof recipe.totalTime === 'number' ? recipe.totalTime : undefined}
                dietType={recipe.dietType as any}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return { title: 'Kochrezepte' }
}
