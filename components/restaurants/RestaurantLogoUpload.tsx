'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import Label from '@/components/ui/Label'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import RestaurantLogo from '@/components/ui/RestaurantLogo'

export default function RestaurantLogoUpload({
  restaurantId,
  restaurantName,
  currentLogo,
  showUrlField = true,
  updateSession = false,
}: {
  restaurantId: string
  restaurantName: string
  currentLogo?: string | null
  showUrlField?: boolean
  /** Actualiza JWT/sessão (navbar) após guardar — usar no painel restaurante */
  updateSession?: boolean
}) {
  const router = useRouter()
  const { update } = useSession()
  const fileRef = useRef<HTMLInputElement>(null)
  const [logoUrl, setLogoUrl] = useState(currentLogo ?? '')
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    setLogoUrl(currentLogo ?? '')
    setPreview(null)
  }, [currentLogo])

  const displayLogo = preview ?? logoUrl ?? currentLogo

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setSuccess(null)
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
  }

  async function syncSession(logo: string | null) {
    if (!updateSession) return
    await update({
      restaurantLogo: logo,
      restaurantName,
    })
  }

  async function uploadLogo() {
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const formData = new FormData()
      const file = fileRef.current?.files?.[0]

      if (file) {
        formData.append('file', file)
      } else if (logoUrl.trim()) {
        formData.append('logoUrl', logoUrl.trim())
      } else {
        throw new Error('Seleccione uma imagem ou indique um caminho/URL.')
      }

      const res = await fetch(`/api/restaurants/${restaurantId}/logo`, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? 'Erro ao guardar logo')
      }

      const saved = data.logo ?? logoUrl
      setLogoUrl(saved)
      setPreview(null)
      if (fileRef.current) fileRef.current.value = ''
      await syncSession(saved)
      setSuccess(data.message ?? 'Logo guardado com sucesso.')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao guardar logo')
    } finally {
      setLoading(false)
    }
  }

  async function removeLogo() {
    if (!confirm('Remover o logo deste restaurante?')) return

    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/logo`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? 'Erro ao remover logo')
      }

      setLogoUrl('')
      setPreview(null)
      if (fileRef.current) fileRef.current.value = ''
      await syncSession(null)
      setSuccess('Logo removido.')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover logo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <RestaurantLogo
          logoPath={displayLogo}
          name={restaurantName}
          className="w-24 h-24 shrink-0"
        />
        <div className="flex-1 space-y-4 w-full">
          <div>
            <Label htmlFor={`logo-file-${restaurantId}`}>Imagem do logo</Label>
            <input
              ref={fileRef}
              id={`logo-file-${restaurantId}`}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={onFileChange}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-brand-500/15 file:text-brand-400 hover:file:bg-brand-500/25"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              A imagem é enviada para o servidor da API (pasta /uploads) e fica
              guardada na base de dados.
            </p>
          </div>

          {showUrlField && (
            <div>
              <Label htmlFor={`logo-url-${restaurantId}`}>
                Ou caminho já existente no servidor
              </Label>
              <Input
                id={`logo-url-${restaurantId}`}
                value={logoUrl}
                onChange={(e) => {
                  setLogoUrl(e.target.value)
                  setPreview(null)
                }}
                placeholder="Ex: /uploads/meu-logo.jpg"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={uploadLogo}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ImagePlus size={16} />
              )}
              {loading ? 'A guardar...' : 'Guardar logo'}
            </Button>
            {(displayLogo || currentLogo) && (
              <Button
                type="button"
                variant="ghost"
                onClick={removeLogo}
                disabled={loading}
                className="gap-2 text-red-400 hover:text-red-300"
              >
                <Trash2 size={16} />
                Remover
              </Button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
          {success}
        </p>
      )}
    </div>
  )
}
