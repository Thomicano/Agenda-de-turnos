"use client";

import { motion } from "framer-motion";
import { Settings, Link2, Zap } from "lucide-react";

const steps = [
  {
    num: "01",
    Icon: Settings,
    title: "Configurá tu agenda",
    desc: "Registrate, cargá tus servicios y horarios en menos de 5 minutos.",
  },
  {
    num: "02",
    Icon: Link2,
    title: "Compartí tu link",
    desc: "Tu página pública queda lista al instante para WhatsApp o Instagram.",
  },
  {
    num: "03",
    Icon: Zap,
    title: "Automatizá todo",
    desc: "El bot responde y confirma por vos. Vos solo aparecés a trabajar.",
  },
];

export default function LandingHowItWorks() {
  return (
    <section id="como-funciona" className="py-32 px-6 relative overflow-hidden">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p className="text-[10px] font-black tracking-[0.3em] uppercase mb-4" style={{ color: "#00FF9F" }}>
            PASO A PASO
          </p>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
            Listo en <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #00FF9F, #008080)" }}>minutos.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          
          {/* ── Conector Mejorado (Desktop) ── */}
          <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-[1px] opacity-20"
               style={{ background: "linear-gradient(90deg, transparent, #00FF9F, transparent)" }} />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="group flex flex-col items-center text-center gap-6"
            >
              {/* Icon Container */}
              <motion.div
                whileHover={{ y: -5 }}
                className="relative w-24 h-24 rounded-3xl flex items-center justify-center border border-white/10 transition-colors group-hover:border-[#00FF9F]/30"
                style={{ background: "rgba(25, 20, 60, 0.4)", backdropFilter: "blur(10px)" }}
              >
                {/* Glow interno */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                     style={{ background: "radial-gradient(circle at center, rgba(0,255,159,0.1) 0%, transparent 70%)" }} />
                
                <step.Icon size={32} className="text-slate-400 group-hover:text-[#00FF9F] transition-colors duration-300" />
                
                {/* Badge con el Número */}
                <span
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center text-[0.7rem] font-black text-slate-900 shadow-lg shadow-[#00FF9F]/20"
                  style={{ background: "linear-gradient(135deg, #00FF9F, #008080)" }}
                >
                  {step.num}
                </span>
              </motion.div>

              <div className="max-w-[200px]">
                <h3 className="text-lg font-black text-white mb-3 uppercase tracking-tight">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}