"use client";

import { useState, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
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
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setFormError(AUTH_ERRORS[error.code ?? ""] ?? "Error al iniciar sesión.");
      setIsSubmitting(false);
      return;
    }

    router.refresh();
    setTimeout(() => {
      router.replace("/admin");
    }, 100);
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-[#0d0d1a] antialiased font-sans">
      
      {/* ── COLUMNA IZQUIERDA: FORMULARIO ── */}
      <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 relative overflow-hidden bg-[#0d0d1a]">
        
        {/* Botón Volver sutil */}
        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-[#00FF9F] transition-colors text-xs font-bold uppercase tracking-widest group z-20">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Volver
        </Link>

        <div className="max-w-md w-full mx-auto z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
              ¡Hola de <br />
              <span className="text-[#00FF9F] italic">nuevo</span>!
            </h1>
            <p className="text-xs text-slate-500 mt-4 font-bold uppercase tracking-[0.2em]">
              Ingresá para gestionar tus turnos.
            </p>
          </motion.div>

          {/* Botón Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-12 mb-6 flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all active:scale-[0.98]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>

          <div className="relative mb-8 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <span className="relative bg-[#0d0d1a] px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">o con tu email</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@negocio.com" 
                  className="input-base pl-12" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input 
                  type={showPwd ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="input-base px-12" 
                />
                <PasswordToggle visible={showPwd} onToggle={togglePwd} />
              </div>
            </div>

            {formError && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase">
                <AlertCircle size={14} /> {formError}
              </motion.div>
            )}

            <motion.button 
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-14 rounded-2xl text-xs font-black text-slate-900 uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(0,255,159,0.15)] flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #00FF9F, #008080)" }}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar al Panel"}
            </motion.button>
          </form>

          <p className="text-center text-[10px] text-slate-500 mt-12 font-black uppercase tracking-widest">
            ¿No tenés cuenta?{' '}
            <Link href="/registro" className="text-[#00FF9F] hover:underline">Registrate gratis</Link>
          </p>
        </div>
      </div>

      {/* ── COLUMNA DERECHA: LOGO TURNIX APP IMAGEN ── */}
      <div className="hidden md:flex relative flex-col justify-center items-center overflow-hidden border-l border-white/5 bg-[#0d0d1a]">
        
        {/* Glow de fondo (Mesh) */}
        <div 
          className="absolute w-[80%] h-[80%] rounded-full blur-[120px] opacity-10"
          style={{ background: "radial-gradient(circle, #00FF9F 0%, #008080 50%, transparent 80%)" }}
        />

        {/* LOGO IMAGEN CENTRADO */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 flex flex-col items-center"
        >
          <img 
            src="/logoTurnixapp-removebg.png" 
            alt="TurnixApp Logo" 
            className="w-48 h-48 object-contain drop-shadow-[0_0_30px_rgba(0,255,159,0.2)]" 
          />
          <div className="h-[2px] w-16 bg-gradient-to-r from-transparent via-[#00FF9F] to-transparent my-6" />
          <p className="text-[10px] font-black tracking-[0.6em] text-slate-500 uppercase">Automatizá tu arte</p>
        </motion.div>

        {/* Decoración inferior */}
        <div className="absolute bottom-10 right-10 flex flex-col items-end opacity-20">
            <p className="text-[8px] font-black text-[#00FF9F] tracking-[0.3em] mb-1 uppercase">Cloud System</p>
            <p className="text-[8px] font-black text-slate-500 tracking-widest uppercase">Version 2.0</p>
        </div>
      </div>
    </div>
  );
}