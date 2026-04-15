"use client";

import { useState, useCallback, memo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion"; // Agregamos motion para coherencia con la landing
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Lock, Mail, AlertCircle, ArrowLeft } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

const AUTH_ERRORS: Record<string, string> = {
  invalid_credentials: "Email o contraseña incorrectos.",
  email_not_confirmed: "Tu email no fue verificado. Revisá tu bandeja.",
  user_not_found: "No existe una cuenta con ese email.",
  too_many_requests: "Demasiados intentos. Esperá unos minutos.",
};

const PasswordToggle = memo(function PasswordToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#00FF9F] transition-colors focus:outline-none"
    >
      {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const togglePwd = useCallback(() => setShowPwd((v) => !v), []);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` }
    });
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    if (!email || !password) {
      setFormError("Completá tu email y contraseña.");
      return;
    }

    setIsSubmitting(true);

    const { error, data } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setFormError(AUTH_ERRORS[error.code ?? ""] ?? "Error al iniciar sesión.");
      setIsSubmitting(false);
      return;
    }

    // 🚀 EL TRUCO ESTÁ ACÁ:
    // 1. Refrescamos para que las cookies de Supabase se sincronicen con el servidor
    router.refresh();

    // 2. Damos un respiro de 100ms para que Next.js procese el cambio
    setTimeout(() => {
      router.replace("/admin");
    }, 100);
  }
  return (
    /* Quitamos bg-slate-50 y dejamos que se vea el fondo de globals.css */
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">

      {/* Botón Volver a la Home */}
      <Link href="/" className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 text-sm transition-colors">
        <ArrowLeft size={16} /> Volver
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Card con Glassmorphism */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-2xl">

          {/* Logo y Titular */}
          <div className="flex flex-col items-center mb-8">
            <img
              src="/logoTurnixapp-removebg.png" // <--- ASEGURATE DE QUE EL NOMBRE COINCIDA
              alt="Logo"
              className="w-14 h-14 mb-4 object-contain"
            />
            <h1 className="text-2xl font-black text-white tracking-tight">
              Turnix<span className="text-[#00FF9F]">App</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Gestión profesional de turnos</p>
          </div>

          {/* Botón Google - Estética Dark */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-11 mb-6 flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-white hover:bg-white/10 transition-all active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continuar con Google
          </button>

          <div className="flex items-center gap-4 mb-6 opacity-30">
            <div className="h-px bg-white flex-1"></div>
            <span className="text-[10px] font-bold text-white uppercase tracking-widest text-center">O con tu cuenta</span>
            <div className="h-px bg-white flex-1"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@ejemplo.com"
                  className="input-base pl-11" // <--- USAMOS TU CLASE DEL CSS GLOBAL
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-base pl-11 pr-11"
                  style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }} // Espacio para Lock y Ojito

                />
                <PasswordToggle visible={showPwd} onToggle={togglePwd} />
              </div>
            </div>

            {formError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <AlertCircle size={14} /> {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-2xl text-sm font-bold text-slate-950 transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #00FF9F, #008080)" }}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar al Panel"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">
            ¿Nuevo por aquí?{" "}
            <Link href="/registro" className="text-[#00FF9F] hover:underline font-bold">
              Crear cuenta gratis
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}