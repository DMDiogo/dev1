import AppShell from '@/components/layout/AppShell'
import { requireAdmin } from '@/lib/session'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return <AppShell variant="admin">{children}</AppShell>
}
