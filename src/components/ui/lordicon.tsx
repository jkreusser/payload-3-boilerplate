'use client'
import React from 'react'

type Props = React.ComponentPropsWithoutRef<'div'> & {
  src: string
  trigger?: 'hover' | 'click' | 'loop' | 'morph' | 'in' | 'out' | 'loop-on-hover'
  colors?: string
  className?: string
  delay?: string | number
}

export const LordIcon = React.forwardRef<any, Props>(
  ({ src, trigger = 'hover', colors, className, delay, ...rest }, ref) => {
    // Verwende React.createElement, um den TS-Fehler für JSX-Custom-Elemente zu umgehen
    return React.createElement('lord-icon' as any, {
      ref: ref as any,
      src,
      trigger,
      colors,
      delay: delay as any,
      class: className as any,
      className: className as any,
      ...(rest as any),
    })
  },
)
LordIcon.displayName = 'LordIcon'
