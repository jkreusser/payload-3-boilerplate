import type { Metadata } from 'next/types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const recipes = await payload.find({
    collection: 'recipes',
    depth: 1,
    limit: 24,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      categories: true,
      heroImage: true,
      shortDescription: true,
    },
  })

  return (
    <div className="pt-24 pb-24">
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Rezepte</h1>
        </div>
      </div>

      <div className="container">
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
          {recipes.docs.map((recipe, idx) => (
            <div key={idx} className="col-span-4">
              <div className="border border-border rounded-lg overflow-hidden bg-card p-4">
                <h3 className="text-lg font-semibold">
                  <Link href={`/recipes/${recipe.slug}`}>{recipe.title}</Link>
                </h3>
                {recipe.shortDescription && (
                  <p className="mt-2 line-clamp-3">{recipe.shortDescription}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return { title: 'Rezepte' }
}
