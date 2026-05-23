'use client'

import { cn } from '@/lib/utils'

function getStrength(password: string) {
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

const labels = ['Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte']

export default function PasswordStrength({ password }: { password: string }) {
  if (!password) return null

  const score = getStrength(password)
  const index = Math.min(Math.floor(score / 1.2), 4)

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              i <= index
                ? index <= 1
                  ? 'bg-red-500'
                  : index <= 2
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                : 'bg-surface-muted'
            )}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500">{labels[index]}</p>
    </div>
  )
}
