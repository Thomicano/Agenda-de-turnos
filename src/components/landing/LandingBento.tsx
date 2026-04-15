"use client";

import { motion } from "framer-motion";
import { MessageCircle, Clock, BarChart2, TrendingUp } from "lucide-react";

// ─── Shared card wrapper ──────────────────────────────────────────────────────
function BentoCard({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
      className={`group relative rounded-3xl border border-white/10 overflow-hidden p-8 transition-all duration-500 ${className}`}
      style={{ background: "rgba(10,15,25,0.4)", backdropFilter: "blur(20px)" }}
    >
      {/* Glow de fondo que se activa al hacer hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
           style={{ background: "radial-gradient(circle at center, rgba(0,255,159,0.08) 0%, transparent 70%)" }} />
      
      {/* Borde sutil que brilla en hover */}
      <div className="absolute inset-px rounded-[23px] border border-[#00FF9F]/0 group-hover:border-[#00FF9F]/20 transition-all duration-500 pointer-events-none" />

      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
} 

// ─── Card 1: WhatsApp Chat Sim ────────────────────────────────────────────────
function WhatsAppCard() {
  const msgs = [
    { from: "user", text: "Hola, quiero un turno para mañana" },
    { from: "bot", text: "¡Hola! Tengo disponibles las 10:00hs y las 14:30hs ¿Cuál preferís? 🗓️" },
    { from: "user", text: "Las 10, perfecto!" },
    { from: "bot", text: "✅ Turno confirmado para mañana 10:00hs. ¡Te espero!" },
  ];

  return (
    <BentoCard delay={0.1}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#25D36615" }}>
          <MessageCircle size={16} color="#25D366" />
        </div>
        <div>
          <p className="text-xs font-bold text-white">Bot de WhatsApp</p>
          <p className="text-[0.6rem] text-slate-500">Activo 24/7</p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-[0.55rem] font-bold px-2 py-0.5 rounded-full" style={{ background: "#25D36615", color: "#25D366" }}>
          <div className="w-1 h-1 rounded-full bg-[#25D366] animate-pulse" />
          Online
        </div>
      </div>

      <div className="space-y-2">
        {msgs.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: msg.from === "bot" ? -10 : 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-3 py-1.5 rounded-2xl text-[0.65rem] font-medium ${msg.from === "user"
                  ? "rounded-tr-sm text-slate-900"
                  : "rounded-tl-sm bg-white/5 text-slate-300"
                }`}
              style={msg.from === "user" ? { background: "#00FF9F", color: "#0a0f16" } : {}}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}
      </div>
    </BentoCard>
  );
}

// ─── Card 2: Slot Picker ──────────────────────────────────────────────────────
function HorariosCard() {
  const slots = ["09:00", "10:30", "12:00", "14:30", "16:00"];

  return (
    <BentoCard delay={0.2}>
      <div className="flex items-center gap-2 mb-5">
        <Clock size={16} style={{ color: "#00FF9F" }} />
        <p className="text-xs font-bold text-white">Elegí tu horario</p>
      </div>
      <p className="text-[0.6rem] text-slate-500 mb-3 uppercase tracking-wider font-bold">Lunes 14 · Abril</p>
      <div className="grid grid-cols-3 gap-2">
        {slots.map((slot, i) => (
          <motion.button
            key={slot}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${i === 1
                ? "text-slate-900"
                : "bg-white/5 text-slate-400 hover:bg-white/10"
              }`}
            style={i === 1 ? { background: "linear-gradient(135deg, #00FF9F, #008080)" } : {}}
          >
            {slot}
          </motion.button>
        ))}
        <div className="py-2 rounded-xl text-xs font-bold bg-white/3 text-slate-600 text-center border border-dashed border-white/5">
          +3 más
        </div>
      </div>
    </BentoCard>
  );
}

// ─── Card 3: Dashboard Summary ────────────────────────────────────────────────
function DashboardCard() {
  const stats = [
    { label: "Hoy", value: "8", sub: "turnos" },
    { label: "Mes", value: "$124k", sub: "estimado" },
    { label: "Tasa", value: "94%", sub: "confirmación" },
  ];

  return (
    <BentoCard delay={0.15}>
      <div className="flex items-center gap-2 mb-5">
        <BarChart2 size={16} style={{ color: "#00FF9F" }} />
        <p className="text-xs font-bold text-white">Resumen del negocio</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white/4 rounded-xl p-3 text-center">
            <p className="text-xl font-black text-white">{s.value}</p>
            <p className="text-[0.55rem] text-slate-500 mt-0.5 uppercase tracking-wide">{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 rounded-xl border border-white/5 bg-white/3">
        <div className="flex justify-between items-center mb-2">
          <p className="text-[0.6rem] text-slate-400 font-medium">Próximos turnos</p>
          <p className="text-[0.6rem]" style={{ color: "#00FF9F" }}>Ver todos →</p>
        </div>
        {[{ name: "Martín G.", time: "09:00" }, { name: "Ana R.", time: "10:30" }].map((t) => (
          <div key={t.name} className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full flex items-center justify-center text-[0.45rem] font-bold" style={{ background: "#00FF9F20", color: "#00FF9F" }}>
                {t.name[0]}
              </div>
              <span className="text-[0.6rem] text-slate-400">{t.name}</span>
            </div>
            <span className="text-[0.6rem] font-bold text-white">{t.time}</span>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}

// ─── Card 4: Sparkline Growth ─────────────────────────────────────────────────
function CrecimientoCard() {
  const data = [20, 35, 28, 50, 45, 72, 68, 90, 85, 110, 105, 132];
  const max = Math.max(...data);
  const min = Math.min(...data);
  const W = 220, H = 70;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / (max - min)) * H;
    return `${x},${y}`;
  });
  const pathD = `M ${pts.join(" L ")}`;

  return (
    <BentoCard delay={0.25} className="col-span-full md:col-span-1">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} style={{ color: "#00FF9F" }} />
        <p className="text-xs font-bold text-white">Crecimiento mensual</p>
      </div>
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-3xl font-black text-white">+132%</p>
          <p className="text-xs text-slate-500">vs. mismo período anterior</p>
        </div>
        <div className="px-2 py-0.5 rounded-full text-[0.6rem] font-bold" style={{ background: "#00FF9F20", color: "#00FF9F" }}>
          ↑ Nuevo récord
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-16" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#008080" />
            <stop offset="100%" stopColor="#00FF9F" />
          </linearGradient>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00FF9F" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#00FF9F" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Fill */}
        <path
          d={`${pathD} L ${W},${H} L 0,${H} Z`}
          fill="url(#sparkFill)"
        />
        {/* Line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="url(#sparkGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
    </BentoCard>
  );
}

// ─── Bento Grid Export ────────────────────────────────────────────────────────
export default function LandingBento() {
  return (
    <section id="caracteristicas" className="py-24 px-6">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "#00FF9F" }}>
            ¿Por qué TurnixApp?
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Todo lo que necesitás,{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #00FF9F, #008080)" }}>
              sin complicaciones.
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* WhatsApp ocupa 2 columnas para que el chat se vea amplio */}
          <div className="md:col-span-2">
            <WhatsAppCard />
          </div>

          <div className="md:col-span-1">
            <HorariosCard />
          </div>

          <div className="md:col-span-1">
            <DashboardCard />
          </div>

          {/* Crecimiento ocupa 2 columnas abajo para lucir el gráfico */}
          <div className="md:col-span-2">
            <CrecimientoCard />
          </div>
        </div>
      </div>
    </section>
  );
}
