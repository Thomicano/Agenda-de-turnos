"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Zap, BellRing } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Emprendedor",
    tagline: "Para quienes recién empiezan.",
    price: "Gratis",
    featured: false,
    features: [
      "Agenda online 24/7",
      "Link de reserva personalizado",
      "1 Trabajador", // Agregamos claridad de límites como la competencia
      "Gestión de hasta 3 servicios",
      "Soporte básico",
      "Panel de administracion"
    ],
    cta: "Comenzar Gratis",
    href: "/registro",
    disabled: false,
  },
  {
    name: "Pro",
    tagline: "El poder completo de TurnixApp.",
    price: "Soon",
    featured: true,
    features: [
      "Bot de WhatsApp con IA 24/7", // Superior a solo "Recordatorios"
      "Integración con Mercado Pago", // ¡Esto es clave!
      "Trabajadores y Equipos ILIMITADOS", // Aquí les ganamos en escala
      "Recordatorios y Notificaciones",
      "Estadísticas avanzadas de facturación",
      "Soporte prioritario 1-on-1",
      "Dominio personalizado",
    ],
    cta: "Notificarme",
    href: "#",
    disabled: true,
  },
];

export default function LandingPricing() {
  return (
    <section id="precios" className="py-32 px-6 relative">
      <div className="container mx-auto max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-[10px] font-black tracking-[0.3em] uppercase mb-4" style={{ color: "#00FF9F" }}>
            PRECIOS
          </p>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
            Simple y <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #00FF9F, #008080)" }}>transparente.</span>
          </h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-4">Sin tarjetas · Sin sorpresas</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -5 }}
              className={`relative flex flex-col rounded-3xl border p-10 transition-all duration-500 ${
                plan.featured ? "border-[#00FF9F]/30" : "border-white/10"
              }`}
              style={{
                background: plan.featured 
                  ? "rgba(0, 255, 159, 0.03)" 
                  : "rgba(25, 20, 60, 0.4)",
                backdropFilter: "blur(20px)",
                boxShadow: plan.featured ? "0 0 60px rgba(0, 255, 159, 0.05)" : "none"
              }}
            >
              {plan.featured && (
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <span className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-[0.65rem] font-black text-slate-900 shadow-[0_0_20px_rgba(0,255,159,0.3)]"
                        style={{ background: "linear-gradient(135deg, #00FF9F, #008080)" }}>
                    <Zap size={12} fill="currentColor" /> PRÓXIMAMENTE
                  </span>
                </div>
              )}

              <div className="mb-10">
                <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-2">{plan.name}</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-5xl font-black tracking-tighter ${plan.featured ? "text-[#00FF9F]" : "text-white"}`}>
                    {plan.price}
                  </span>
                  {plan.price !== "Gratis" && plan.price !== "Soon" && <span className="text-slate-500 text-sm">/mes</span>}
                </div>
                <p className="text-xs text-slate-400 mt-4 font-medium leading-relaxed">{plan.tagline}</p>
              </div>

              <div className="flex-1 space-y-4 mb-10">
                {plan.features.map((feat) => (
                  <div key={feat} className="flex items-center gap-3 group">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#00FF9F]/10 flex items-center justify-center">
                      <CheckCircle2 size={12} style={{ color: "#00FF9F" }} />
                    </div>
                    <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors tracking-tight">{feat}</span>
                  </div>
                ))}
              </div>

              <Link
                href={plan.href}
                className={`group flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  plan.disabled
                    ? "bg-white/5 border border-white/10 text-slate-600 cursor-not-allowed"
                    : "text-slate-900 hover:brightness-110 hover:shadow-[0_0_30px_rgba(0,255,159,0.2)]"
                }`}
                style={!plan.disabled ? { background: "linear-gradient(135deg, #00FF9F, #008080)" } : {}}
                onClick={(e) => plan.disabled && e.preventDefault()}
              >
                {plan.disabled && <BellRing size={14} className="group-hover:animate-shake" />}
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}