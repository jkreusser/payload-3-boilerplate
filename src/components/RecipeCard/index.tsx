'use client'
import Link from 'next/link'
import React from 'react'
import { Media } from '@/components/Media'
import FavoriteHeart from '@/components/FavoriteHeart/Heart.client'

type Props = {
  slug: string
  title: string
  description?: string | null
  image?: any
  category?: string | null
  totalTime?: number | null
  dietType?: string | string[] | null
}

export const RecipeCard: React.FC<Props> = ({
  slug,
  title,
  description,
  image,
  category,
  totalTime,
  dietType,
}) => {
  return (
    <Link
      href={`/recipes/${slug}`}
      className="group block border border-border rounded-lg overflow-hidden bg-card focus:outline-none focus:ring-2 focus:ring-primary/50"
    >
      <div className="relative w-full">
        {image && typeof image !== 'string' ? (
          <Media resource={image as any} size="33vw" />
        ) : (
          <div className="aspect-[16/9] bg-muted" />
        )}
        <div className="absolute top-2 right-2 z-10 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm grid place-items-center">
          <FavoriteHeart slug={slug} title={title} />
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description ? <p className="mt-2 line-clamp-3">{description}</p> : null}
        <div className="flex items-center justify-between mt-2 text-sm opacity-75">
          {category ? <span>{category}</span> : <span />}
          <div className="ml-auto flex items-center gap-4">
            {typeof totalTime === 'number' ? <span>{totalTime} min</span> : null}
            {dietType ? <span>{Array.isArray(dietType) ? dietType[0] : dietType}</span> : null}
          </div>
        </div>
      </div>
    </Link>
  )
}
