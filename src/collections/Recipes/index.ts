import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { slugField } from '@/fields/slug'
import { revalidateRecipe } from './revalidateRecipe'

const UNIT_OPTIONS = [
  { label: 'Gramm', value: 'g' },
  { label: 'Kilogramm', value: 'kg' },
  { label: 'Milliliter', value: 'ml' },
  { label: 'Liter', value: 'l' },
  { label: 'Teelöffel', value: 'TL' },
  { label: 'Esslöffel', value: 'EL' },
  { label: 'Stück', value: 'stueck' },
]

const CATEGORIES_OPTIONS = [
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
].map((label) => ({ label, value: label }))

const DIET_TYPE_OPTIONS = ['Vegetarisch', 'Vegan', 'Laktosefrei', 'Glutenfrei'].map((label) => ({
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
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 0,
        },
        {
          name: 'unit',
          type: 'select',
          options: UNIT_OPTIONS,
          required: true,
        },
        {
          name: 'note',
          type: 'text',
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


