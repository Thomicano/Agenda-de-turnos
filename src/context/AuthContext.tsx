"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** Usuario autenticado actualmente (null si no hay sesión). */
  user: User | null;
  /** Sesión activa completa (incluye access_token, refresh_token, etc.). */
  session: Session | null;
  /** true mientras se resuelve la sesión inicial al montar el provider. */
  isLoading: boolean;
  /** Cierra la sesión del usuario actual en Supabase. */
  signOut: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // true por defecto

  useEffect(() => {
    // 1️⃣  Obtener la sesión inicial (puede venir de cookies / localStorage)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // 2️⃣  Suscribirse a cambios futuros de estado de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      // Si ya terminó la carga inicial pero llega un evento, nos aseguramos
      // de que isLoading esté en false (guarda de seguridad).
      setIsLoading(false);
    });

    // 3️⃣  Limpiar la suscripción al desmontar para evitar memory leaks
    return () => {
      subscription.unsubscribe();
    };
  }, []); // Sin dependencias: se ejecuta una única vez al montar

  // Memoizamos signOut para que los consumidores no re-rendericen
  // innecesariamente si el contexto no cambió en otros campos.
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    // onAuthStateChange actualizará user y session a null automáticamente.
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook de consumo ──────────────────────────────────────────────────────────

/**
 * Hook para acceder al contexto de autenticación.
 * Lanza un error explícito si se usa fuera de <AuthProvider>.
 *
 * @example
 * const { user, isLoading, signOut } = useAuth();
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth() debe usarse dentro de un <AuthProvider>. " +
        "Asegurate de haber envuelto tu layout raíz con <AuthProvider>."
    );
  }

  return ctx;
}
