/** Tarjeta con un brillo que sigue al cursor. */

'use client'

import { cn } from '@/lib/utils'

interface ShineCardProps extends React.AllHTMLAttributes<HTMLElement> {
  shineColor?: string | string[]
  borderWidth?: number
  duration?: number
  as?: 'div' | 'a' | 'section'
  href?: string
}

/**
 * Tarjeta minimal premium. Antes pintaba un borde arcoíris animado;
 * ahora es una superficie sobria (negro translúcido + borde tenue) con
 * un realce sutil en rojo al pasar el cursor. Mantiene la misma API para
 * no romper las páginas que ya la usan (props de shine se ignoran).
 */
export function ShineCard({
  children,
  className,
  as: Tag = 'div',
  href,
  // props heredadas — aceptadas pero ya no se usan
  shineColor: _shineColor,
  borderWidth: _borderWidth,
  duration: _duration,
  ...props
}: ShineCardProps) {
  const Comp = Tag === 'a' ? 'a' : Tag

  return (
    <Comp
      className={cn(
        'relative rounded-2xl border border-white/[0.08] bg-white/[0.03] transition-colors duration-300',
        'hover:border-red-500/30',
        className,
      )}
      href={href}
      {...props}
    >
      {children}
    </Comp>
  )
}
