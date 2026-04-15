"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Lock, Mail, AlertCircle, ArrowLeft, User } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    if (!email || !password || !fullName) {
      setFormError("Por favor, completá todos los campos.");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setFormError(error.message);
      setIsSubmitting(false);
      return;
    }

    // Registro exitoso - Redirigir o mostrar mensaje de verificación
    router.push("/login?message=Verificá tu email para continuar");
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-[#0d0d1a] antialiased font-sans">
      
      {/* ── COLUMNA IZQUIERDA: FORMULARIO ── */}
      <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 relative overflow-hidden bg-[#0d0d1a]">
        
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
              Creá tu <br />
              <span className="text-[#00FF9F] italic">cuenta</span>
            </h1>
            <p className="text-xs text-slate-500 mt-4 font-bold uppercase tracking-[0.2em]">
              Empezá a gestionar tu negocio hoy.
            </p>
          </motion.div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre" 
                  className="input-base pl-12" 
                />
              </div>
            </div>

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
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="input-base px-12" 
                />
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
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear mi cuenta"}
            </motion.button>
          </form>

          <p className="text-center text-[10px] text-slate-500 mt-12 font-black uppercase tracking-widest">
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" className="text-[#00FF9F] hover:underline">Iniciá sesión</Link>
          </p>
        </div>
      </div>

      {/* ── COLUMNA DERECHA: LOGO TURNIX APP IMAGEN ── */}
      <div className="hidden md:flex relative flex-col justify-center items-center overflow-hidden border-l border-white/5 bg-[#0d0d1a]">
        
        <div 
          className="absolute w-[80%] h-[80%] rounded-full blur-[120px] opacity-10"
          style={{ background: "radial-gradient(circle, #00FF9F 0%, #008080 50%, transparent 80%)" }}
        />

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

        <div className="absolute bottom-10 right-10 flex flex-col items-end opacity-20">
            <p className="text-[8px] font-black text-[#00FF9F] tracking-[0.3em] mb-1 uppercase italic">Unite a la red</p>
            <p className="text-[8px] font-black text-slate-500 tracking-widest uppercase">Version 2.0</p>
        </div>
      </div>
    </div>
  );
}