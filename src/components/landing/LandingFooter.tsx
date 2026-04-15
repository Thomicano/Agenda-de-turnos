"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="border-t border-white/5 pt-32 pb-12 px-6">
      {/* CTA final */}
      <div className="container mx-auto max-w-4xl mb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-[32px] overflow-hidden p-16 text-center border border-[#00FF9F]/20"
          style={{
            background: "rgba(25, 20, 60, 0.4)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 0 80px rgba(0, 255, 159, 0.05)",
          }}
        >
          {/* Dot pattern sutil */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "radial-gradient(circle, #00FF9F 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          
          <div className="relative z-10">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase mb-6" style={{ color: "#00FF9F" }}>
              EMPEZÁ HOY · SIN COSTO
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6 uppercase italic leading-none">
              Tu agenda llena, <br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #00FF9F, #008080)" }}>
                siempre.
              </span>
            </h2>
            <p className="text-slate-400 text-sm mb-10 max-w-sm mx-auto leading-relaxed font-medium">
              Configurá tu negocio en minutos y empezá a recibir turnos automáticamente hoy mismo.
            </p>
            
            <Link
              href="/registro"
              className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl text-sm font-black text-slate-900 transition-all duration-300 hover:brightness-110 hover:-translate-y-1 uppercase tracking-widest shadow-2xl shadow-[#00FF9F]/20"
              style={{
                background: "linear-gradient(135deg, #00FF9F, #008080)",
              }}
            >
              Crear mi negocio gratis <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer bottom */}
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-white text-lg tracking-tighter">TURNIX</span>
              <span className="text-[#00FF9F] text-lg tracking-tighter italic">APP</span>
            </div>
            <span className="text-slate-800">|</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-600">BY</span>
              <span className="text-slate-300 hover:text-[#00FF9F] transition-colors cursor-default">THOMAS AGUSTÍN CANO</span>
            </div>
          </div>

          <p className="text-slate-700 tracking-normal font-medium italic">© {new Date().getFullYear()} — HECHO CON PASIÓN POR EL CÓDIGO.</p>

          <div className="flex gap-6">
            {[
              { href: "/terminos", label: "Términos" },
              { href: "/privacidad", label: "Privacidad" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}