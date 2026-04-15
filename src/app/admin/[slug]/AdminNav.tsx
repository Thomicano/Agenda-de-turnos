"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Calendar, Scissors, Settings, Home, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import BusinessSwitcher from "./BusinessSwitcher";
import UserProfile from "@/components/admin/UserProfile";

export default function AdminNav() {
  const params = useParams();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  
  // 💡 NUEVO: Estado para expandir la barra al pasar el mouse
  const [isHovered, setIsHovered] = useState(false);

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

  // 💡 NUEVO: Detectamos si estamos en la agenda para colapsar por defecto
  const isAgenda = pathname?.includes("/agenda");
  
  // La barra está colapsada SI estamos en la agenda Y NO le pasamos el mouse por encima
  const isCollapsed = isAgenda && !isHovered;

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
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-[#00FF9F] transition-all font-bold"
        >
          <Home className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Volver al inicio</span>}
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
              className={`relative flex items-center p-3 rounded-xl transition-all duration-300 group ${
                isCollapsed ? "justify-center" : "gap-3"
              } ${
                isActive
                  ? "bg-[#00FF9F]/10 text-[#00FF9F] font-bold shadow-[0_0_20px_rgba(0,255,159,0.05)]"
                  : "text-slate-400 hover:bg-white/5 hover:text-white font-medium"
              }`}
            >
              {/* Indicador lateral verde */}
              {isActive && (
                <div className="absolute left-0 w-1 h-6 bg-[#00FF9F] rounded-r-full shadow-[0_0_10px_#00FF9F]" />
              )}
              
              <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
              
              {/* Solo mostramos el texto si NO está colapsado */}
              {!isCollapsed && <span className="whitespace-nowrap animate-in fade-in duration-300">{link.label}</span>}
            </Link>
          );
        })
      )}
    </nav>
  );

  return (
    <>
      {/* 📱 Mobile Topbar (Queda exactamente igual) */}
      <div className="md:hidden flex items-center justify-between bg-[#0d0d1a] border-b border-white/10 px-4 py-3 sticky top-0 z-20 shadow-sm">
        <h2 className="text-xl font-black tracking-tight text-white">
          Turnix<span className="text-[#00FF9F]">App</span>
        </h2>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-[#0d0d1a] p-6 border-r border-white/10 flex flex-col">
            <SheetHeader>
              <SheetTitle className="text-2xl font-black tracking-tight text-white text-left border-b border-white/10 pb-4 mb-4">
                Menu
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 flex flex-col">
              <div className="mb-2">
                <BusinessSwitcher />
              </div>

              {!slugValido && (
                <p className="text-xs text-amber-500 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 mt-2">
                  Seleccioná un negocio para continuar.
                </p>
              )}
              <NavLinks />
            </div>
            
            <div className="mt-auto pt-4 border-t border-white/10">
              <UserProfile />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* 💻 Desktop Sidebar (Con lógica de Auto-Colapso) */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden md:flex flex-col bg-[#0d0d1a] border-r border-white/10 h-screen sticky top-0 overflow-x-hidden transition-all duration-300 ease-in-out z-50 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className={`flex flex-col h-full py-6 transition-all duration-300 ${isCollapsed ? "px-2" : "px-6"}`}>
          
          <h2 className={`font-black tracking-tight text-white border-b border-white/10 pb-4 mb-4 whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "text-xl text-center" : "text-2xl"}`}>
            {isCollapsed ? (
              <div className="flex justify-center w-full">
                {/* Asegurate de poner el nombre real de tu archivo de logo abajo */}
                <img src="/logoturnixapp-removebg.png" alt="Logo" className="w-10 h-10 object-contain" />
              </div>  
            ) : (
              <>Turnix<span className="text-[#00FF9F]">App</span></>
            )}
          </h2>

          <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
            {/* Ocultamos el switcher suavemente si está colapsado */}
            <div className={`transition-all duration-300 overflow-hidden ${isCollapsed ? "opacity-0 h-0" : "opacity-100 h-auto mb-4"}`}>
              <BusinessSwitcher />
            </div>

            {!slugValido && !isCollapsed && (
              <p className="text-xs text-amber-500 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 mt-2 font-medium">
                Seleccioná un negocio desde la URL.
              </p>
            )}
            
            <NavLinks />
          </div>

          {/* Ocultamos el perfil suavemente si está colapsado */}
          <div className={`mt-auto border-t border-white/10 transition-all duration-300 overflow-hidden ${isCollapsed ? "opacity-0 h-0 pt-0" : "opacity-100 h-auto pt-4"}`}>
            <UserProfile />
          </div>
        </div>
      </aside>
    </>
  );
}