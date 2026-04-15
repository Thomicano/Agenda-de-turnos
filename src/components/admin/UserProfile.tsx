"use client";
import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { User, Mail, ShieldCheck, LogOut, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserProfile() {
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [supabase]);

  if (!user) return null;

  const provider = user.app_metadata?.provider || 'email';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    /* 🟢 Borde superior sutil en blanco/10 */
    <div className="mt-auto border-t border-white/10 pt-4 relative px-2 mb-2" ref={dropdownRef}>
      
      {/* 🔴 MENÚ FLOTANTE (Glassmorphism Dark) */}
      {isOpen && (
        <div className="absolute bottom-full mb-3 left-0 w-full bg-[#0d0d1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
          <div className="p-4 bg-white/5 border-b border-white/5">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Cuenta Conectada</p>
            <div className="flex items-center gap-2">
              {provider === 'google' ? <ShieldCheck size={14} className="text-[#00FF9F]" /> : <Mail size={14} className="text-slate-400" />}
              <p className="text-sm font-medium text-slate-200 truncate">{user.email}</p>
            </div>
          </div>
          <div className="p-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full p-2.5 text-sm font-bold text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors"
            >
              <LogOut size={16} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      {/* 🔵 BOTÓN DE PERFIL (Estética Cyber Mint) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 p-2 rounded-2xl transition-all duration-200 border ${
          isOpen ? "bg-white/10 border-white/20" : "border-transparent hover:bg-white/5 hover:border-white/10"
        }`}
      >
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#00FF9F] to-[#008080] p-[1.5px] shrink-0 shadow-lg shadow-[#00FF9F]/10">
          <div className="h-full w-full rounded-full bg-[#0d0d1a] flex items-center justify-center overflow-hidden">
            {user.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <User size={18} className="text-[#00FF9F]" />
            )}
          </div>
        </div>
        <div className="flex-1 overflow-hidden text-left">
          <p className="text-sm font-black text-white truncate">
            {user.user_metadata?.full_name || "Admin"}
          </p>
          <div className="flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-[#00FF9F] animate-pulse" />
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
               {provider}
             </p>
          </div>
        </div>
        <MoreVertical size={16} className={`${isOpen ? 'text-white' : 'text-slate-500'} transition-colors shrink-0`} />
      </button>
    </div>
  );
}