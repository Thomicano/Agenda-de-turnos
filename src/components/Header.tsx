export default function Header() {
  return (
    <header
      className="
        w-full
        border-b
        bg-white   /* COLOR HEADER - cambiar acá */
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          px-6
          py-4
          flex
          items-center
          justify-between
        "
      >
        {/* LOGO / NOMBRE DEL PROYECTO */}
        <h1
          className="
            text-xl
            font-bold
            text-indigo-600 /* COLOR LOGO */
          "
        >
          Turnero
        </h1>

        {/* NAV */}
        <nav className="hidden md:flex gap-6">
          <a className="text-gray-700 hover:text-indigo-600" href="#">
            Cómo funciona
          </a>
          <a className="text-gray-700 hover:text-indigo-600" href="#">
            Precios
          </a>
          <a className="text-gray-700 hover:text-indigo-600" href="#">
            FAQ
          </a>
          <a className="text-gray-700 hover:text-indigo-600" href="#">
            Contacto
          </a>
        </nav>

        {/* CTA */}
        <a
          href="/crear-negocio"
          className="
            bg-indigo-600  /* COLOR BOTÓN PRINCIPAL */
            text-white
            px-4
            py-2
            rounded-lg
            hover:bg-indigo-700
            transition
          "
        >
          Comenzar ahora
        </a>
      </div>
    </header>
  );
}
