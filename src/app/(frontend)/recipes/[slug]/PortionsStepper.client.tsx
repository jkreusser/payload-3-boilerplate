'use client'
import React from 'react'

const KEY = 'recipe:servings'

export function PortionsStepper({
  slug,
  baseServings,
  onChange,
}: {
  slug: string
  baseServings: number
  onChange: (factor: number) => void
}) {
  const [servings, setServings] = React.useState<number>(baseServings || 1)

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const map = JSON.parse(raw) as Record<string, number>
        if (typeof map[slug] === 'number') setServings(map[slug])
      }
    } catch {}
  }, [slug])

  React.useEffect(() => {
    const factor = servings / (baseServings || 1)
    onChange(Number.isFinite(factor) && factor > 0 ? factor : 1)
  }, [servings, baseServings, onChange])

  const save = (next: number) => {
    setServings(next)
    try {
      const raw = localStorage.getItem(KEY)
      const map = raw ? (JSON.parse(raw) as Record<string, number>) : {}
      map[slug] = next
      localStorage.setItem(KEY, JSON.stringify(map))
    } catch {}
  }

  return (
    <div className="flex items-center gap-2">
      <button className="px-2 py-1 border rounded" onClick={() => save(Math.max(1, servings - 1))}>
        -
      </button>
      <div className="min-w-10 text-center">{servings}</div>
      <button className="px-2 py-1 border rounded" onClick={() => save(servings + 1)}>
        +
      </button>
    </div>
  )
}
