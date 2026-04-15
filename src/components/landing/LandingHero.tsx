"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap, Calendar, MessageCircle } from "lucide-react";
  
// ─── Floating mock UI ─────────────────────────────────────────────────────────
function DashboardMock() {
  const slots = [
    { time: "09:00", name: "Martín G.", status: "confirmed" },
    { time: "10:30", name: "Ana R.", status: "confirmed" },
    { time: "11:00", name: "Disponible", status: "open" },
    { time: "12:00", name: "Lucas P.", status: "pending" },
  ];

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Glow halo */}
      <div
        className="absolute inset-0 -z-10 blur-3xl opacity-30 rounded-3xl"
        style={{ background: "radial-gradient(circle, #00FF9F 0%, #008080 50%, transparent 80%)" }}
      />

      {/* Mock window */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40"
        style={{ background: "rgba(15,20,30,0.85)", backdropFilter: "blur(20px)" }}
      >
        {/* Top bar */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
          <span className="w-3 h-3 rounded-full bg-rose-500/70" />
          <span className="w-3 h-3 rounded-full bg-amber-400/70" />
          <span className="w-3 h-3 rounded-full" style={{ background: "#00FF9F", opacity: 0.7 }} />
          <div className="flex-1 mx-4 h-5 rounded-full border border-white/10 flex items-center px-3 gap-2 bg-white/5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#00FF9F" }} />
            <span className="text-[0.6rem] text-slate-400">turnixapp.pro/tu-negocio</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-white">Lunes · Abril 14</p>
              <p className="text-[0.6rem] text-slate-500">4 turnos agendados</p>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border text-[0.55rem] font-bold" style={{ borderColor: "#00FF9F40", color: "#00FF9F", background: "#00FF9F10" }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00FF9F" }} />
              EN LÍNEA
            </div>
          </div>

          {slots.map((slot) => (
            <motion.div
              key={slot.time}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs transition-all ${slot.status === "open"
                ? "border-dashed border-white/10 text-slate-600"
                : slot.status === "pending"
                  ? "border-amber-500/20 bg-amber-500/5"
                  : "border-white/5 bg-white/3"
                }`}
            >
              <span className="text-[0.6rem] font-bold text-slate-500 w-8 shrink-0">{slot.time}</span>
              {slot.status === "open" ? (
                <span className="text-[0.6rem] text-slate-600 italic">Slot disponible</span>
              ) : (
                <>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[0.5rem] font-bold shrink-0"
                    style={{ background: "#00FF9F20", color: "#00FF9F" }}>
                    {slot.name[0]}
                  </div>
                  <span className="text-[0.62rem] font-semibold text-slate-300 flex-1">{slot.name}</span>
                  <span className={`text-[0.5rem] font-bold px-1.5 py-0.5 rounded-full ${slot.status === "pending" ? "bg-amber-500/20 text-amber-400" : "text-slate-900"
                    }`} style={slot.status === "confirmed" ? { background: "#00FF9F", color: "#0a0f16" } : {}}>
                    {slot.status === "pending" ? "Pendiente" : "Confirmado"}
                  </span>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Floating badges */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-4 -right-4 flex items-center gap-2 px-3 py-2 rounded-2xl border border-white/10 shadow-xl"
        style={{ background: "rgba(15,20,30,0.9)", backdropFilter: "blur(12px)" }}
      >
        <MessageCircle size={14} style={{ color: "#00FF9F" }} />
        <div>
          <p className="text-[0.6rem] font-bold text-white">Bot activo</p>
          <p className="text-[0.55rem] text-slate-400">3 chats abiertos</p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute -top-4 -left-4 flex items-center gap-2 px-3 py-2 rounded-2xl border border-white/10 shadow-xl"
        style={{ background: "rgba(15,20,30,0.9)", backdropFilter: "blur(12px)" }}
      >
        <Zap size={14} style={{ color: "#00FF9F" }} />
        <p className="text-[0.6rem] font-bold text-white">+12% esta semana</p>
      </motion.div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
export default function LandingHero() {
  return (
    <section className="relative min-h-screen flex items-center px-6 pt-10 pb-20 overflow-hidden">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(#00FF9F 1px, transparent 1px), linear-gradient(90deg, #00FF9F 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-15"
        style={{ background: "radial-gradient(circle, #00FF9F, #008080, transparent)" }}
      />

      <div className="container mx-auto max-w-6xl grid md:grid-cols-2 gap-16 items-center relative z-10">
        {/* Copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 text-xs font-semibold text-slate-400 mb-8"
            style={{ background: "rgba(0,255,159,0.05)" }}
          >
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00FF9F" }} />
            Barberías · Peluquerías · Spas · Clínicas
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.03] mb-6"
          >
            Tu agenda en{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #00FF9F 0%, #008080 100%)" }}
            >
              piloto{" "}
            </span>
            <br />
            automático.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-slate-400 max-w-md mb-10 leading-relaxed"
          >
            Dejá de responder mensajes fuera de hora. Tus clientes reservan solos
            en segundos — vos te enfocás en tu arte.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/registro"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-slate-900 transition-all duration-200 hover:brightness-110 hover:-translate-y-1 hover:shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #00FF9F, #008080)",
                boxShadow: "0 0 40px rgba(0,255,159,0.25)",
              }}
            >
              Crear mi agenda gratis <ArrowRight size={18} />
            </Link>
            <Link
              href="/peluqueria-test"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-slate-300 border border-white/10 hover:bg-white/5 hover:text-white transition-all duration-200"
            >
              <Calendar size={16} />
              Ver demo en vivo
            </Link>
          </motion.div>

          {/* Trust stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-8 mt-12"
          >
            {[
              { value: "+2.000", label: "negocios activos" },
              { value: "4.9 ★", label: "valoración" },
              { value: "100%", label: "sin comisiones" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-xl font-black text-white">{s.value}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Mock */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <DashboardMock />
        </motion.div>
      </div>
    </section>
  );
}
