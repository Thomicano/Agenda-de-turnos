import AdminNav from "./AdminNav";
import { Toaster } from "react-hot-toast";

type LayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50/50">
      <AdminNav />
      {/* 
        flex-1: Toma el resto del espacio disponible.
        p-4 md:p-8: Padding dinámico (menos padding en celu para aprovechar espacio).
        w-full overflow-x-hidden: Evita barras de scroll horizontales indeseadas en celular.
      */}
      <main className="flex-1 p-4 md:p-8 w-full max-w-[100vw] overflow-x-hidden">
        {children}
      </main>
      <Toaster position="top-right" />
    </div>
  );
}
