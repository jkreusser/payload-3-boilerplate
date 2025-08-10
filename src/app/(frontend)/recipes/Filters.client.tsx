'use client'
import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function Filters({
  categories,
  dietTypes,
  multiDiet = true,
}: {
  categories: string[]
  dietTypes: string[]
  multiDiet?: boolean
}) {
  const router = useRouter()
  const sp = useSearchParams()
  const [category, setCategory] = React.useState(sp.get('category') || '')
  const initialDiets = React.useMemo(() => sp.getAll('diet'), [sp])
  const [diets, setDiets] = React.useState<string[]>(initialDiets)
  const [maxTime, setMaxTime] = React.useState(sp.get('max') || '')

  const pushParams = (next: { category?: string; diets?: string[]; maxTime?: string }) => {
    const p = new URLSearchParams()
    const cat = next.category ?? category
    const ds = next.diets ?? diets
    const mx = next.maxTime ?? maxTime
    if (cat) p.set('category', cat)
    if (ds && ds.length) ds.forEach((d) => p.append('diet', d))
    if (mx) p.set('max', mx)
    router.push(`/recipes?${p.toString()}`)
  }

  return (
    <div className="container mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <select
          className="border border-border rounded px-3 py-2 bg-card text-foreground"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value)
            pushParams({ category: e.target.value })
          }}
        >
          <option value="">Alle Kategorien</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {multiDiet ? (
          <select
            className="border border-border rounded px-3 py-2 bg-card text-foreground"
            multiple
            value={diets}
            onChange={(e) => {
              const vals = Array.from(e.currentTarget.selectedOptions).map((o) => o.value)
              setDiets(vals)
              pushParams({ diets: vals })
            }}
          >
            {dietTypes.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        ) : (
          <select
            className="border border-border rounded px-3 py-2 bg-card text-foreground"
            value={diets[0] || ''}
            onChange={(e) => {
              const val = e.currentTarget.value ? [e.currentTarget.value] : []
              setDiets(val)
              pushParams({ diets: val })
            }}
          >
            <option value="">Alle Ernährungsformen</option>
            {dietTypes.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        )}
        <div className="flex gap-2">
          <select
            className="border border-border rounded px-3 py-2 w-full bg-card text-foreground"
            value={maxTime}
            onChange={(e) => {
              setMaxTime(e.target.value)
              pushParams({ maxTime: e.target.value })
            }}
          >
            <option value="">Gesamtzeit (alle)</option>
            {['15', '20', '30', '45', '60'].map((m) => (
              <option key={m} value={m}>
                bis {m} min
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
