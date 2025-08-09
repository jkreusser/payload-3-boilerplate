import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { lexicalEditor, FixedToolbarFeature, InlineToolbarFeature, HeadingFeature, HorizontalRuleFeature, BlocksFeature } from '@payloadcms/richtext-lexical'
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
      name: 'intro',
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
          name: 'ingredient',
          type: 'relationship',
          relationTo: 'ingredients',
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
          name: 'content',
          type: 'richText',
          editor: lexicalEditor({
            features: ({ rootFeatures }) => [
              ...rootFeatures,
              HeadingFeature({ enabledHeadingSizes: ['h3', 'h4'] }),
              FixedToolbarFeature(),
              InlineToolbarFeature(),
              HorizontalRuleFeature(),
              BlocksFeature({ blocks: [] }),
            ],
          }),
          label: false,
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
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
    ...slugField(),
  ],
  hooks: {
    afterChange: [revalidateRecipe],
  },
}


