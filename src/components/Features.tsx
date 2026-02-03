export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
        
        <div className="p-6 border rounded-xl">
          📅 <h3 className="font-bold text-xl mt-2">Agenda online</h3>
          <p className="text-gray-600">
            Tus clientes reservan solos 24/7.
          </p>
        </div>

        <div className="p-6 border rounded-xl">
          🔔 <h3 className="font-bold text-xl mt-2">Recordatorios</h3>
          <p className="text-gray-600">
            Evitá ausencias con avisos automáticos.
          </p>
        </div>

        <div className="p-6 border rounded-xl">
          💳 <h3 className="font-bold text-xl mt-2">Suscripciones</h3>
          <p className="text-gray-600">
            Planes mensuales para cada negocio.
          </p>
        </div>

      </div>
    </section>
  )
}
