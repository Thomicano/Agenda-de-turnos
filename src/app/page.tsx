import type { Metadata } from "next";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingHero from "@/components/landing/LandingHero";
import LandingBento from "@/components/landing/LandingBento";
import LandingHowItWorks from "@/components/landing/LandingHowItWorks";
import LandingPricing from "@/components/landing/LandingPricing";
import LandingFooter from "@/components/landing/LandingFooter";
import Marquee from "@/components/ui/marquee"; // Importamos el componente que agregaste
import LandingFAQ from "@/components/landing/LandingFaq";
export const metadata: Metadata = {
  title: "TurnixApp — Gestión de turnos automática para tu negocio",
  description:
    "Agenda online, bot de WhatsApp y recordatorios automáticos para barberías, peluquerías, spas y más. Gratis para empezar.",
  keywords: ["turnos online", "agenda digital", "reservas automáticas", "barbería", "peluquería"],
};

// Logos strip data
const logosRow = [
  "Barber Club", "LaVida Spa", "Studio Cut", "Nails Pro",
  "Elite Barber", "Urban Groom", "Bliss Studio", "Corte & Style",
];

export default function HomePage() {
  return (
    // Recuperamos el fondo original del video (slate-950) y la fuente Geist
    <div className="min-h-screen flex flex-col bg-slate-950 text-white antialiased font-sans">

      {/* ── HEADER ── */}
      <LandingHeader />

      <main className="flex-grow overflow-x-hidden">

        {/* ── HERO ── */}
        <LandingHero />

        {/* ── SOCIAL PROOF STRIP (Turnix-ified Marquee) ── */}
        {/* Usamos tu fondo y bordes originales del video, pero con el Marquee pro */}
        <div className="border-y border-white/5 py-8 overflow-hidden bg-slate-950/50 backdrop-blur-sm">
          <p className="text-center text-[0.65rem] font-bold tracking-widest text-slate-600 uppercase mb-6">
            Confían en nosotros
          </p>
          
          <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
            <Marquee pauseOnHover className="[--duration:40s]">
              {logosRow.map((name, i) => (
                <span 
                  key={i} 
                  className="mx-8 text-xl font-bold italic tracking-tighter text-slate-400 hover:text-white transition-colors cursor-default"
                >
                  {name}
                </span>
              ))}
            </Marquee>

            {/* Gradientes laterales para el efecto de "fade" sobre tu fondo slate-950 */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-slate-950"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-slate-950"></div>
          </div>
        </div>

        {/* ── BENTO FEATURES ── */}
        <LandingBento />

        {/* ── HOW IT WORKS ── */}
        {/* Subtle divider */}
        <div className="container mx-auto max-w-5xl px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        <LandingHowItWorks />

        {/* ── PRICING ── */}
        <div className="container mx-auto max-w-5xl px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        <LandingPricing />
        <div className="container mx-auto max-w-5x1 px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
          <LandingFAQ />
      </main>

      {/* ── FOOTER ── */}
      <LandingFooter />
    </div>
  );
}