import RestaurantSetupForm from '@/components/restaurant/RestaurantSetupForm'

export default function RestaurantSetupPage() {
  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
        Registar o seu restaurante
      </h1>
      <p className="text-gray-400 mt-2 mb-8 text-sm leading-relaxed">
        Conta criada com sucesso. Preencha os dados do estabelecimento para
        gerir produtos e pedidos. Só você terá acesso a este restaurante.
      </p>
      <RestaurantSetupForm />
    </div>
  )
}
