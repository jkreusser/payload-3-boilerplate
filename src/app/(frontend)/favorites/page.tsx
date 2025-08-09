"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link'

type Fav = { slug: string; title?: string }

const FAV_KEY = 'favorites:recipes'

export default function FavoritesPage() {
  const [favs, setFavs] = useState<Fav[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY)
      if (raw) setFavs(JSON.parse(raw))
    } catch {}
  }, [])

  return (
    <div className="pt-24 pb-24">
      <div className="container mb-8">
        <h1 className="text-2xl font-semibold">Merkliste</h1>
        <p className="opacity-80">Deine gemerkten Rezepte</p>
      </div>

      <div className="container">
        {favs.length === 0 && <div className="opacity-70">Noch keine Rezepte gemerkt.</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favs.map((f, i) => (
            <div key={i} className="border rounded p-4">
              <Link href={`/recipes/${f.slug}`} className="font-medium">{f.title || f.slug}</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


