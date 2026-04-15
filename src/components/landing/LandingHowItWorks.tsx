"use client";

import { motion } from "framer-motion";
import { Settings, Link2, Zap } from "lucide-react";

const steps = [
  {
    num: "01",
    Icon: Settings,
    title: "Configurá tu agenda",
    desc: "Registrate, cargá tus servicios, employees y horarios disponibles en menos de 5 minutos.",
  },
  {
    num: "02",
    Icon: Link2,
    title: "Compartí tu link",
    desc: "Tu página pública queda lista al instante. Mandásela a tus clientes por WhatsApp, IG o donde quieras.",
  },
  {
    num: "03",
    Icon: Zap,
    title: "Automatizá todo",
    desc: "El bot responde, confirma y recuerda por vos. Vos solo aparecés a trabajar.",
  },
];

export default function LandingHowItWorks() {
  return (
    <section id="como-funciona" className="py-24 px-6">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "#00FF9F" }}>
            En 3 pasos
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Listo en menos de 5 minutos.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-12 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px"
            style={{ background: "linear-gradient(90deg, transparent, #00FF9F30, transparent)" }}
          />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="flex flex-col items-center text-center gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="relative w-20 h-20 rounded-2xl flex items-center justify-center border border-white/10"
                style={{ background: "rgba(0,255,159,0.05)" }}
              >
                <step.Icon size={28} style={{ color: "#00FF9F" }} />
                <span
                  className="absolute -top-3 -right-3 w-7 h-7 rounded-full flex items-center justify-center text-[0.6rem] font-black text-slate-900"
                  style={{ background: "linear-gradient(135deg, #00FF9F, #008080)" }}
                >
                  {step.num}
                </span>
              </motion.div>

              <div>
                <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
