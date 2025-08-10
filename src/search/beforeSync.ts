import { BeforeSync, DocToSync } from '@payloadcms/plugin-search/types'

export const beforeSyncWithSearch: BeforeSync = async ({ originalDoc, searchDoc, payload }) => {
  const {
    doc: { relationTo: collection },
  } = searchDoc

  const { slug, id, categories, title, meta, excerpt } = originalDoc as any

  const modifiedDoc: DocToSync = {
    ...searchDoc,
    slug,
    meta: {
      ...meta,
      title: meta?.title || title,
      image: meta?.image?.id || meta?.image,
      description: meta?.description,
    },
    categories: [],
  }

  if (categories && Array.isArray(categories) && categories.length > 0) {
    // get full categories and keep a flattened copy of their most important properties
    try {
      const mappedCategories = categories.map((category) => {
        const { id, title } = category

        return {
          relationTo: 'categories',
          id,
          title,
        }
      })

      modifiedDoc.categories = mappedCategories
    } catch (err) {
      console.error(
        `Failed. Category not found when syncing collection '${collection}' with id: '${id}' to search.`,
      )
    }
  }

  // recipes-spezifische Felder ergänzen
  if (collection === 'recipes') {
    try {
      const r = originalDoc as any
      const tags = Array.isArray(r.tags) ? r.tags.map((t: any) => t?.value).filter(Boolean) : []
      const diet = Array.isArray(r.dietType) ? r.dietType : r.dietType ? [r.dietType] : []
      const ingredients = Array.isArray(r.ingredientsList)
        ? r.ingredientsList.map((i: any) => i?.name).filter(Boolean)
        : []

        // Meta-Defaults: falls kein meta.image/description gesetzt, nimm heroImage/shortDescription
        ; (modifiedDoc as any).meta = {
          ...(modifiedDoc as any).meta,
          description: (modifiedDoc as any).meta?.description || r.shortDescription || '',
          image: (modifiedDoc as any).meta?.image || r.heroImage?.id || r.heroImage || undefined,
        }
      // Kategorien als einfache Titel (Enum) in den Index legen
      if (Array.isArray(r.categories)) {
        ; (modifiedDoc as any).categories = r.categories.map((title: string) => ({ title }))
      }

      ; (modifiedDoc as any).dietType = diet.map((d: string) => ({ value: d }))
        ; (modifiedDoc as any).tags = tags.map((t: string) => ({ value: t }))
        ; (modifiedDoc as any).ingredients = ingredients.map((n: string) => ({ value: n }))
    } catch { }
  }

  return modifiedDoc
}
