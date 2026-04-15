export default function Hero() {
  return (
    <section
      className="
        bg-gray-50   /* COLOR FONDO HERO */
        py-24
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          px-6
          text-center
        "
      >
        {/* TÍTULO PRINCIPAL */}
        <h2
          className="
            text-4xl
            md:text-5xl
            font-bold
            text-gray-900 /* COLOR TÍTULO */
          "
        >
          Gestioná los turnos de tu negocio sin llamadas ni mensajes
        </h2>

        {/* SUBTÍTULO */}
        <p
          className="
            mt-6
            text-lg
            text-gray-600 /* COLOR TEXTO SECUNDARIO */
            max-w-2xl
            mx-auto
          "
        >
          Creá tu agenda online en minutos y dejá que tus clientes reserven solos,
          las 24 horas.
        </p>

        {/* BOTONES */}
        <div className="mt-10 flex justify-center gap-4">
          <a
            href="/crear-negocio"
            className="
              bg-indigo-600 /* COLOR BOTÓN PRINCIPAL */
              text-white
              px-6
              py-3
              rounded-lg
              text-lg
              hover:bg-indigo-700
              transition
            "
          >
            Comenzar ahora
          </a>

          <a
            href="#"
            className="
              border
              border-gray-300
              px-6
              py-3
              rounded-lg
              text-lg
              text-gray-700
              hover:bg-gray-100
              transition
            "
          >
            Ver demo
          </a>
        </div>
      </div>
    </section>
  );
}
