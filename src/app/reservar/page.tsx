import Link from "next/link";

export default function ReservarPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow">
        <h1 className="text-3xl font-bold text-gray-900">Reservar turno</h1>
        <p className="text-gray-600 mt-2">
          Para reservar necesitás ingresar al link único del negocio (su <span className="font-mono">slug</span>).
        </p>

        <div className="mt-6 space-y-4">
          <div className="rounded-lg bg-gray-50 border p-4">
            <p className="text-sm text-gray-700">
              Ejemplo de link:
            </p>
            <p className="font-mono text-sm mt-2">
              /<span className="text-amber-600">mi-negocio</span>
            </p>
          </div>

          <Link
            href="/crear-negocio"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            Crear mi agenda
          </Link>
        </div>
      </div>
    </main>
  );
}
