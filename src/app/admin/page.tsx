import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow max-w-md">
        <h1 className="text-2xl font-bold mb-2">Panel Admin</h1>
        <p className="text-gray-600 mb-6">
          Para administrar tu negocio, entrá con el slug en la URL:
        </p>
        <p className="font-mono text-sm bg-gray-100 p-3 rounded mb-6">
          /admin/<span className="text-amber-600">tu-negocio</span>/servicios
        </p>
        <Link
          href="/"
          className="text-blue-600 hover:underline"
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
