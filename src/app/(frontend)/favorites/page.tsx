'use client'
import React from 'react'
import { RecipeCard } from '@/components/RecipeCard'

type Fav = { slug: string; title?: string }

const FAV_KEY = 'favorites:recipes'

export default function FavoritesPage() {
  const [favs, setFavs] = React.useState<Fav[]>([])
  const [recipes, setRecipes] = React.useState<any[]>([])

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY)
      const list: Fav[] = raw ? JSON.parse(raw) : []
      setFavs(list)
    } catch {}
    const onStorage = (e: StorageEvent) => {
      if (e.key === FAV_KEY) {
        try {
          const list: Fav[] = e.newValue ? JSON.parse(e.newValue) : []
          setFavs(list)
        } catch {}
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  React.useEffect(() => {
    const load = async () => {
      if (!favs.length) return setRecipes([])
      try {
        const qs = new URLSearchParams()
        favs.forEach((f) => qs.append('where[slug][in]', f.slug))
        qs.set('limit', '100')
        qs.set('depth', '1')
        qs.set('draft', 'false')
        const res = await fetch(`/api/recipes?${qs.toString()}`)
        if (!res.ok) {
          const text = await res.text()
          console.error('Favorites REST error', text)
          setRecipes([])
          return
        }
        const json = await res.json()
        setRecipes(json?.docs || [])
      } catch {
        setRecipes([])
      }
    }
    load()
  }, [favs])

  return (
    <div className="pt-24 pb-24">
      <div className="container mb-8">
        <h1 className="text-2xl font-semibold">Merkliste</h1>
        <p className="opacity-80">Deine gemerkten Rezepte</p>
      </div>

      <div className="container">
        {recipes.length === 0 && <div className="opacity-70">Noch keine Rezepte gemerkt.</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((r, i) => (
            <RecipeCard
              key={i}
              slug={r.slug}
              title={r.title}
              description={r.shortDescription}
              image={r.heroImage}
              category={
                Array.isArray(r.categories) && r.categories.length > 0 ? r.categories[0] : undefined
              }
              totalTime={typeof r.totalTime === 'number' ? r.totalTime : undefined}
              dietType={r.dietType}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
