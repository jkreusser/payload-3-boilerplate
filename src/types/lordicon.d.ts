import type { CSSProperties, DetailedHTMLProps, HTMLAttributes } from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lord-icon': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string
        trigger?: 'hover' | 'click' | 'loop' | 'morph' | 'in' | 'out' | 'loop-on-hover'
        colors?: string
        delay?: string | number
        state?: string
        target?: string
        stroke?: string | number
        class?: string
        style?: CSSProperties
      }
    }
  }
}

export {}


