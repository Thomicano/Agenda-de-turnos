"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Github, Twitter } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="border-t border-white/5 pt-20 pb-10 px-6">
      {/* CTA final */}
      <div className="container mx-auto max-w-4xl mb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden p-12 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(0,255,159,0.08) 0%, rgba(0,128,128,0.12) 100%)",
            border: "1px solid rgba(0,255,159,0.15)",
          }}
        >
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, #00FF9F 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative z-10">
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "#00FF9F" }}>
              Empezá hoy · Sin costo
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
              Tu agenda llena, siempre.
            </h2>
            <p className="text-slate-400 text-sm mb-10 max-w-md mx-auto leading-relaxed">
              Configurá tu negocio en minutos y empezá a recibir turnos automáticamente hoy mismo.
            </p>
            <Link
              href="/registro"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-slate-900 transition-all duration-200 hover:brightness-110 hover:-translate-y-1"
              style={{
                background: "linear-gradient(135deg, #00FF9F, #008080)",
                boxShadow: "0 0 40px rgba(0,255,159,0.3)",
              }}
            >
              Crear mi negocio gratis <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer bottom */}
      <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <span className="font-black text-white">Turnix</span>
          <span className="text-transparent bg-clip-text font-black" style={{ backgroundImage: "linear-gradient(135deg, #00FF9F, #008080)" }}>App</span>
          <span className="text-slate-700">·</span>
          <span>Diseñado y desarrollado por</span>
          <span className="text-slate-300 font-semibold">Thomas Agustín Cano</span>
        </div>

        <p className="text-slate-700">© {new Date().getFullYear()} TurnixApp. Todos los derechos reservados.</p>

        <div className="flex gap-4">
          {[
            { href: "/terminos", label: "Términos" },
            { href: "/privacidad", label: "Privacidad" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-slate-400 transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
