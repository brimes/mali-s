'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  /** Tamanho da logo */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Mostrar o texto junto com a logo */
  showText?: boolean
  /** Texto personalizado (padrão: Mali-S) */
  text?: string
  /** Classe CSS adicional */
  className?: string
  /** Tema da logo (para diferentes contextos) */
  theme?: 'light' | 'dark'
}

const sizeVariants = {
  sm: {
    logo: 'h-6 w-6',
    text: 'text-sm',
    container: 'gap-2'
  },
  md: {
    logo: 'h-8 w-8',
    text: 'text-base',
    container: 'gap-2'
  },
  lg: {
    logo: 'h-12 w-12',
    text: 'text-lg',
    container: 'gap-3'
  },
  xl: {
    logo: 'h-20 w-20',
    text: 'text-2xl',
    container: 'gap-4'
  }
}

export function Logo({ 
  size = 'md', 
  showText = false, 
  text = 'Mali-S', 
  className,
  theme = 'light'
}: LogoProps) {
  const variant = sizeVariants[size]
  
  return (
    <div className={cn(
      'flex items-center',
      variant.container,
      className
    )}>
      <div className="relative">
        <Image
          src="/mali-saloes-logo-2.png"
          alt="Mali-S Logo"
          width={80}
          height={80}
          className={cn(
            'object-contain',
            variant.logo
          )}
          priority
        />
      </div>
      {showText && (
        <span className={cn(
          'font-bold',
          variant.text,
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          {text}
        </span>
      )}
    </div>
  )
}