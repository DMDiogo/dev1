import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function Logo({
  size = 40,
  showText = true,
  href,
  className,
}: {
  size?: number
  showText?: boolean
  href?: string
  className?: string
}) {
  const content = (
    <div className={cn('flex items-center gap-3', className)}>
      <Image
        src="/logo.svg"
        alt="FoodAdmin"
        width={size}
        height={size}
        priority
        className="rounded-xl"
      />
      {showText && (
        <div>
          <p className="font-display font-bold text-brand-500 text-lg leading-tight">
            FoodAdmin
          </p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">
            Gestão de Restaurantes
          </p>
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {content}
      </Link>
    )
  }

  return content
}
