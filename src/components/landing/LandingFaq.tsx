"use client";

import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "¿Cómo funciona el bot de WhatsApp?",
    answer: "Nuestro bot con IA actúa como tu asistente 24/7. Responde mensajes, muestra horarios disponibles y confirma turnos automáticamente sin que vos tengas que tocar el teléfono.",
  },
  {
    question: "¿Es realmente gratis?",
    answer: "Sí, el plan Emprendedor es gratis para siempre. Está pensado para quienes recién empiezan y necesitan una agenda profesional sin costos fijos.",
  },
  {
    question: "¿Puedo cobrar los turnos por Mercado Pago?",
    answer: "¡Totalmente! En el plan Pro podés integrar Mercado Pago para señar o cobrar el total del servicio al momento de la reserva, evitando cancelaciones de último momento.",
  },
  {
    question: "¿Tengo un límite de empleados o servicios?",
    answer: "En el plan Emprendedor tenés hasta 3 servicios. En el plan Pro, podés cargar empleados y servicios ILIMITADOS. Ideal para barberías o clínicas con mucho equipo.",
  },
  {
    question: "¿Cómo se enteran mis clientes de su turno?",
    answer: "Turnix envía recordatorios automáticos por WhatsApp y mail. Esto reduce el ausentismo hasta en un 80% porque tus clientes siempre tienen la información a mano.",
  },
];

function FAQItem({ question, answer, i }: { question: string; answer: string; i: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1 }}
      className="mb-4"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 rounded-2xl border border-white/10 text-left transition-all hover:bg-white/5"
        style={{ background: "rgba(25, 20, 60, 0.4)", backdropFilter: "blur(10px)" }}
      >
        <span className="text-sm font-bold text-white uppercase tracking-tight">{question}</span>
        {isOpen ? <Minus size={18} style={{ color: "#00FF9F" }} /> : <Plus size={18} style={{ color: "#00FF9F" }} />}
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="px-6 pb-6 pt-2 text-xs text-slate-400 leading-relaxed font-medium"
        >
          {answer}
        </motion.div>
      )}
    </motion.div>
  );
}

export default function LandingFAQ() {
  return (
    <section id="faq" className="py-24 px-6">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-[10px] font-black tracking-[0.3em] uppercase mb-4" style={{ color: "#00FF9F" }}>
            DESPEJÁ TUS DUDAS
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
            Preguntas <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #00FF9F, #008080)" }}>frecuentes.</span>
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <FAQItem key={i} {...faq} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}       