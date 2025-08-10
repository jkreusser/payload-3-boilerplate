import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { slugField } from '@/fields/slug'
import { revalidateRecipe } from '@/collections/Recipes/revalidateRecipe'

const UNIT_OPTIONS = [
  { label: 'g', value: 'g' },
  { label: 'kg', value: 'kg' },
  { label: 'ml', value: 'ml' },
  { label: 'l', value: 'l' },
  { label: 'TL', value: 'TL' },
  { label: 'EL', value: 'EL' },
  { label: 'Stk', value: 'stueck' },
  { label: 'Prise', value: 'prise' },
  { label: 'Schuss', value: 'schuss' },
  { label: 'Dose', value: 'dose' },
]

export const RECIPE_CATEGORIES: string[] = [
  'Gutes mit Fleisch',
  'Fisch & Meeresfrüchte',
  'Bunte Gemüseküche',
  'Für Veggies',
  'Nudelgerichte',
  'Reisgerichte',
  'Suppenliebe',
  'Leckere Salate',
  'Süße Desserts',
  'Asiatische Rezepte',
  'Burger & Sandwiches',
  'Gutes Frühstück',
  'Schnelle Snacks',
  'Saucen, Dips & Pesto',
  'Eis Rezepte',
  'Getränke',
  'Schnelle Rezepte',
  'Sommer Rezepte',
  'Herbst Rezepte',
  'Weihnachtsrezepte',
]

const CATEGORIES_OPTIONS = RECIPE_CATEGORIES.map((label) => ({ label, value: label }))

export const RECIPE_DIET_TYPES: string[] = ['Vegetarisch', 'Vegan', 'Laktosefrei', 'Glutenfrei']

const DIET_TYPE_OPTIONS = RECIPE_DIET_TYPES.map((label) => ({
  label,
  value: label,
}))

export const Recipes: CollectionConfig<'recipes'> = {
  slug: 'recipes',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'shortDescription',
      type: 'textarea',
    },
    {
      name: 'metaTitle',
      type: 'text',
    },
    {
      name: 'metaDescription',
      type: 'textarea',
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'ingredientsList',
      label: 'Zutaten',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'isSection',
          label: 'Bereich / Gruppe (dieser Eintrag ist ein Abschnittstitel)',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'quantity',
          type: 'number',
          // optional, z.B. "1 Zwiebel" ohne exakte Menge
          min: 0,
          admin: {
            condition: (_, siblingData) => !siblingData?.isSection,
          },
        },
        {
          name: 'unit',
          type: 'select',
          options: UNIT_OPTIONS,
          // optional, z.B. "1 Zwiebel" ohne Einheit
          admin: {
            condition: (_, siblingData) => !siblingData?.isSection,
          },
        },
        {
          name: 'note',
          type: 'text',
          admin: {
            condition: (_, siblingData) => !siblingData?.isSection,
          },
        },
      ],
    },
    {
      name: 'steps',
      label: 'Zubereitung',
      type: 'array',
      fields: [
        {
          name: 'text',
          type: 'textarea',
          required: true,
        },
        {
          name: 'durationMinutes',
          type: 'number',
          min: 0,
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'servings',
      type: 'number',
      min: 1,
      defaultValue: 2,
    },
    {
      type: 'row',
      fields: [
        { name: 'prepTime', type: 'number', label: 'Vorbereitungszeit (min)', min: 0 },
        { name: 'cookTime', type: 'number', label: 'Kochzeit (min)', min: 0 },
        { name: 'totalTime', type: 'number', label: 'Gesamtzeit (min)', min: 0 },
      ],
    },
    {
      name: 'categories',
      label: 'Kategorien',
      type: 'select',
      hasMany: true,
      options: CATEGORIES_OPTIONS,
    },
    {
      name: 'dietType',
      label: 'Ernährungsform',
      type: 'select',
      hasMany: true,
      options: DIET_TYPE_OPTIONS,
    },
    {
      name: 'tags',
      label: 'Tags',
      type: 'array',
      fields: [
        { name: 'value', type: 'text' },
      ],
    },
    ...slugField(),
  ],
  hooks: {
    afterChange: [revalidateRecipe],
  },
}


