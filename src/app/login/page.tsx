"use client";

import { useState, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, EyeOff, Calendar, Loader2, Lock, Mail, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Mapa de errores Supabase → español ───────────────────────────────────────
const AUTH_ERRORS: Record<string, string> = {
  invalid_credentials: "Email o contraseña incorrectos.",
  email_not_confirmed: "Tu email no fue verificado. Revisá tu bandeja.",
  user_not_found:      "No existe una cuenta con ese email.",
  too_many_requests:   "Demasiados intentos. Esperá unos minutos.",
};

// ─── Componente atómico: toggle "ojito" ───────────────────────────────────────
// memo() evita re-renders cuando cambian email/password
interface PasswordToggleProps {
  visible: boolean;
  onToggle: () => void;
}

const PasswordToggle = memo(function PasswordToggle({ visible, onToggle }: PasswordToggleProps) {
  return (
    <button
      type="button"
      tabIndex={-1}
      onClick={onToggle}
      aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
    >
      {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );
});

// ─── Página ────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPwd,      setShowPwd]      = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError,    setFormError]    = useState<string | null>(null);

  const togglePwd = useCallback(() => setShowPwd((v) => !v), []);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`
      }
    });
  };

  // ─── Recuperar contraseña ─────────────────────────────────────────────────
  async function handleForgotPassword() {
    const trimmed = email.trim();
    if (!trimmed) {
      setFormError("Ingresá tu email para recibir el link de recuperación.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) {
      toast.error("No se pudo enviar el email de recuperación.");
    } else {
      toast.success("¡Revisá tu bandeja! Te enviamos el link de recuperación.");
    }
  }

  // ─── Submit ───────────────────────────────────────────────────────────────
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
      setFormError(AUTH_ERRORS[error.code ?? ""] ?? "Ocurrió un error al iniciar sesión.");
      setIsSubmitting(false);
      return;
    }

    // Éxito: redirigir directo, sin useEffect
    router.replace("/admin");
  }

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">

      <div className="w-full max-w-sm">

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 sm:p-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-4">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Turnero<span className="text-indigo-600">Pro</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Ingresá a tu panel de administración
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-11 mb-6 flex items-center justify-center gap-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all duration-150 active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continuar con Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              O continuar con email
            </span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Campo Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFormError(null); }}
                  placeholder="tu@email.com"
                  disabled={isSubmitting}
                  className="
                    w-full h-11 pl-10 pr-4 rounded-xl text-sm text-slate-900
                    bg-slate-100/70 border border-slate-200
                    placeholder:text-slate-400
                    outline-none transition-all duration-150
                    focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-indigo-600 hover:text-indigo-500 font-medium transition-colors focus:outline-none focus-visible:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFormError(null); }}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  className="
                    w-full h-11 pl-10 pr-11 rounded-xl text-sm text-slate-900
                    bg-slate-100/70 border border-slate-200
                    placeholder:text-slate-400
                    outline-none transition-all duration-150
                    focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                />
                {/* Componente atómico memoizado */}
                <PasswordToggle visible={showPwd} onToggle={togglePwd} />
              </div>
            </div>

            {/* Error inline — arriba del botón submit */}
            {formError && (
              <div
                className="flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-sm bg-red-50 border border-red-200 text-red-700"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
                <span>{formError}</span>
              </div>
            )}

            {/* Botón Ingresar — sólido, sin transparencias */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                w-full h-12 rounded-xl text-sm font-semibold text-white
                bg-indigo-600 hover:bg-indigo-700
                flex items-center justify-center gap-2
                shadow-md shadow-indigo-600/25
                transition-all duration-150
                disabled:opacity-60 disabled:cursor-not-allowed
                active:scale-[0.98]
              "
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Ingresando…
                </>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>

          {/* Link de registro — texto limpio */}
          <p className="text-center text-sm text-slate-500 mt-6">
            ¿No tienes cuenta?{" "}
            <Link
              href="/registro"
              className="text-indigo-600 hover:text-indigo-500 font-semibold transition-colors"
            >
              Regístrate
            </Link>
          </p>
        </div>

        {/* Footer micro */}
        <p className="text-center text-slate-400 text-xs mt-5">
          © {new Date().getFullYear()} TurneroPro · Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
