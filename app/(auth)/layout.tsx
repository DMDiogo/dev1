export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col lg:flex-row">
      <div className="lg:hidden relative overflow-hidden bg-surface border-b border-surface-border px-6 py-8">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/15 via-transparent to-transparent" />
        <div className="relative">
          <h2 className="font-display text-xl font-bold text-white">
            FoodAdmin
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Gestão de restaurantes em Angola
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface border-r border-surface-border">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-12 w-full">
          <div />
          <div>
            <h2 className="font-display text-3xl xl:text-4xl font-bold text-white leading-tight max-w-md">
              Gerencie o seu restaurante com clareza e controlo total.
            </h2>
            <p className="text-gray-400 mt-4 max-w-sm text-base xl:text-lg">
              Pedidos, produtos, clientes e motoristas num único painel — em
              tempo real.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                Pedidos, produtos e horários num só lugar
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                Dados seguros e encriptados
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                Interface responsiva em qualquer dispositivo
              </li>
            </ul>
          </div>
          <p className="text-sm text-gray-600">© FoodAdmin · Angola</p>
        </div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
