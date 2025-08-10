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
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <lord-icon
        ref={ref as any}
        src={src}
        trigger={trigger}
        colors={colors}
        delay={delay as any}
        class={className as any}
        {...(rest as any)}
      ></lord-icon>
    )
  },
)
LordIcon.displayName = 'LordIcon'
