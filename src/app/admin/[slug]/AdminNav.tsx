"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Calendar, Scissors, Settings, Home, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import BusinessSwitcher from "./BusinessSwitcher";

export default function AdminNav() {
  const params = useParams();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const rawSlug = params?.slug;
  const slug =
    typeof rawSlug === "string"
      ? rawSlug
      : Array.isArray(rawSlug)
        ? rawSlug[0]
        : undefined;

  const slugValido =
    typeof slug === "string" &&
    slug.trim().length > 0 &&
    slug !== "undefined" &&
    slug !== "null";

  const links = slugValido
    ? [
        { href: `/admin/${slug}`, label: "Resumen", icon: Home },
        { href: `/admin/${slug}/servicios`, label: "Servicios", icon: Scissors },
        { href: `/admin/${slug}/agenda`, label: "Agenda", icon: Calendar },
        { href: `/admin/${slug}/configuracion`, label: "Configuración", icon: Settings },
      ]
    : [];

  const NavLinks = () => (
    <nav className="space-y-2 flex flex-col mt-4">
      {!slugValido ? (
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-blue-600 hover:underline transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">Volver al inicio</span>
        </Link>
      ) : (
        links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          );
        })
      )}
    </nav>
  );

  return (
    <>
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between bg-white border-b px-4 py-3 sticky top-0 z-20 shadow-sm">
        <h2 className="text-xl font-bold tracking-tight text-gray-800">Panel Admin</h2>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-6 h-6 text-gray-700" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-white p-6 border-r">
            <SheetHeader>
               <SheetTitle className="text-2xl font-bold tracking-tight text-gray-800 text-left border-b pb-4 mb-4">
                 Panel Admin
               </SheetTitle>
            </SheetHeader>
            
            {/* === 2A. SWITCHER EN MOBILE === */}
            <div className="mb-2">
              <BusinessSwitcher />
            </div>

            {!slugValido && (
              <p className="text-sm text-amber-600 mt-2">
                Seleccioná un negocio desde la URL.
              </p>
            )}
            <NavLinks />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r min-h-screen p-6 sticky top-0 z-10">
        <h2 className="text-2xl font-bold tracking-tight text-gray-800 border-b pb-4 mb-4">
          Panel Admin
        </h2>
        
        {/* === 2B. SWITCHER EN DESKTOP === */}
        <div className="mb-2">
          <BusinessSwitcher />
        </div>

        {!slugValido && (
          <p className="text-sm text-amber-600 mt-2">
            Seleccioná un negocio desde la URL.
          </p>
        )}
        <NavLinks />
      </aside>
    </>
  );
}