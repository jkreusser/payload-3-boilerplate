'use client'
import React from 'react'
import { PortionsStepper } from './PortionsStepper.client'

export function useScaledIngredients(initial: any[]) {
  const [factor, setFactor] = React.useState(1)
  const scaled = React.useMemo(() => {
    return (initial || []).map((row: any) => ({
      ...row,
      quantity:
        typeof row.quantity === 'number'
          ? Math.round(row.quantity * factor * 100) / 100
          : row.quantity,
    }))
  }, [initial, factor])
  return { factor, setFactor, scaled }
}

export default function RecipeClient({
  slug,
  baseServings,
  ingredients,
  onFactor,
}: {
  slug: string
  baseServings: number
  ingredients: any[]
  onFactor: (f: number) => void
}) {
  return (
    <div className="my-4">
      <div className="text-sm mb-2 opacity-75">Portionen</div>
      <PortionsStepper slug={slug} baseServings={baseServings} onChange={onFactor} />
    </div>
  )
}

export function IngredientsScaler({
  slug,
  baseServings,
  ingredients,
}: {
  slug: string
  baseServings: number
  ingredients: any[]
}) {
  const { scaled, setFactor } = useScaledIngredients(ingredients)
  // Gruppiere anhand Abschnittszeilen (isSection=true), deren Name als Titel dient
  const grouped = React.useMemo(() => {
    const groups: Array<{ title?: string; items: any[] }> = []
    let current: { title?: string; items: any[] } | null = null
    for (const row of scaled) {
      if (row?.isSection) {
        current = { title: row.name, items: [] }
        groups.push(current)
      } else {
        if (!current) {
          current = { items: [] }
          groups.push(current)
        }
        current.items.push(row)
      }
    }
    return groups
  }, [scaled])
  return (
    <div>
      <RecipeClient
        slug={slug}
        baseServings={baseServings}
        ingredients={ingredients}
        onFactor={setFactor}
      />
      {grouped.map((group, gi) => (
        <div key={gi} className="mb-4">
          {group.title && <div className="font-medium mt-4 mb-1">{group.title}</div>}
          <ul className="list-disc pl-6">
            {group.items.map((row: any, idx: number) => (
              <li key={idx}>
                {row.quantity} {row.unit} {row.name}
                {row.note ? `, ${row.note}` : ''}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
