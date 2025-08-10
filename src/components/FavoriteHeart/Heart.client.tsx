'use client'
import React from 'react'
import { LordIcon } from '@/components/ui/lordicon'

const FAV_KEY = 'favorites:recipes'

export default function FavoriteHeart({
  slug,
  title,
  src,
}: {
  slug: string
  title?: string
  src?: string
}) {
  const [active, setActive] = React.useState(false)
  // Ref auf das native <lord-icon> Element (vom Wrapper durchgereicht)
  const FILLED = 'https://cdn.lordicon.com/gbkitytd.json'
  const iconSrc = src || process.env.NEXT_PUBLIC_LORDICON_HEART_FILLED || FILLED
  const elRef = React.useRef<any>(null)

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY)
      const list = raw ? (JSON.parse(raw) as any[]) : []
      const isFav = !!list.find((x) => x?.slug === slug)
      setActive(isFav)
    } catch {}
  }, [slug])

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      const raw = localStorage.getItem(FAV_KEY)
      const list = raw ? (JSON.parse(raw) as any[]) : []
      const exists = list.find((x) => x?.slug === slug)
      const next = exists ? list.filter((x) => x?.slug !== slug) : [{ slug, title }, ...list]
      localStorage.setItem(FAV_KEY, JSON.stringify(next))
      const el = elRef.current as any
      // Toggle visual state via color only; icon stays filled
      setActive(!exists)
      // Fire storage event for other tabs/components and to make Favorites page reactive
      try {
        window.dispatchEvent(
          new StorageEvent('storage', { key: FAV_KEY, newValue: JSON.stringify(next) }),
        )
      } catch {}
      // Play a brief hover animation on click for feedback
      try {
        el?.play?.()
      } catch {}
    } catch {}
  }

  const colors = active ? 'primary:#ef4444,secondary:#ef4444' : 'primary:#ffffff,secondary:#ffffff'

  return (
    <button type="button" aria-label="Merken" onClick={toggle} className="inline-flex items-center">
      <LordIcon
        ref={elRef}
        src={iconSrc}
        trigger="hover"
        colors={active ? 'primary:#ef4444,secondary:#ef4444' : 'primary:#ffffff,secondary:#ffffff'}
        className="w-6 h-6"
      />
    </button>
  )
}
