"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Emprendedor",
    tagline: "Para quienes recién empiezan.",
    price: "Gratis",
    priceUnit: null,
    featured: false,
    features: [
      "Agenda online personalizada",
      "Link público de reservas",
      "Panel de administración",
      "Hasta 3 servicios",
    ],
    cta: "Comenzar Gratis",
    href: "/registro",
    disabled: false,
  },
  {
    name: "Pro",
    tagline: "El poder completo de TurnixApp.",
    price: "Coming Soon",
    priceUnit: null,
    featured: true,
    features: [
      "Bot de WhatsApp 24/7",
      "Recordatorios automáticos",
      "Empleados y equipos ilimitados",
      "Analytics avanzados",
      "Dominio personalizado",
    ],
    cta: "Notificarme",
    href: "#",
    disabled: true,
  },
];

export default function LandingPricing() {
  return (
    <section id="precios" className="py-24 px-6">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "#00FF9F" }}>
            Precios
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Simple y transparente.
          </h2>
          <p className="text-slate-400 text-sm">Sin tarjeta de crédito. Sin sorpresas.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -4 }}
              className={`relative flex flex-col rounded-2xl border p-8 transition-shadow ${
                plan.featured
                  ? "shadow-2xl"
                  : "border-white/8"
              }`}
              style={
                plan.featured
                  ? {
                      background: "rgba(0,255,159,0.04)",
                      borderColor: "#00FF9F40",
                      boxShadow: "0 0 60px rgba(0,255,159,0.08)",
                    }
                  : { background: "rgba(15,22,35,0.7)", backdropFilter: "blur(12px)" }
              }
            >
              {plan.featured && (
                <div
                  className="absolute -top-4 inset-x-0 flex justify-center"
                >
                  <span
                    className="flex items-center gap-1 px-4 py-1 rounded-full text-[0.65rem] font-black text-slate-900"
                    style={{ background: "linear-gradient(135deg, #00FF9F, #008080)" }}
                  >
                    <Zap size={11} /> Próximamente
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p className={`text-sm font-bold mb-0.5 ${plan.featured ? "text-white" : "text-slate-300"}`}>
                  {plan.name}
                </p>
                <p className="text-xs text-slate-500">{plan.tagline}</p>
                <div className="mt-4">
                  <span className={`text-4xl font-black ${plan.featured ? "text-transparent bg-clip-text" : "text-white"}`}
                    style={plan.featured ? { backgroundImage: "linear-gradient(135deg, #00FF9F, #008080)" } : {}}>
                    {plan.price}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-3 mb-8">
                {plan.features.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: "#00FF9F" }} />
                    <span className="text-sm text-slate-400">{feat}</span>
                  </div>
                ))}
              </div>

              <Link
                href={plan.href}
                className={`w-full py-3 rounded-xl text-sm font-bold text-center transition-all duration-200 ${
                  plan.disabled
                    ? "border border-white/10 text-slate-600 cursor-default"
                    : "text-slate-900 hover:brightness-110 hover:-translate-y-0.5"
                }`}
                style={!plan.disabled ? { background: "linear-gradient(135deg, #00FF9F, #008080)", boxShadow: "0 0 20px rgba(0,255,159,0.2)" } : {}}
                onClick={(e) => plan.disabled && e.preventDefault()}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
