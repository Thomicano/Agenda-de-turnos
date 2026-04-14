import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  CheckCircle2,
  Calendar,
  Smartphone,
  Zap,
  Shield,
  ArrowRight,
  Sparkles,
  Clock,
  Star,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: Smartphone,
    title: "Reservas 24/7",
    description:
      "Tu negocio nunca cierra. Recibí turnos incluso mientras dormís o estás trabajando.",
    gradient: "from-indigo-500/10 to-violet-500/10",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    hoverBorder: "hover:border-indigo-200/80",
    hoverShadow: "hover:shadow-indigo-50",
  },
  {
    icon: Zap,
    title: "Recordatorios Automáticos",
    description:
      "WhatsApp y Email. Reducí el ausentismo hasta un 80% con avisos automáticos.",
    gradient: "from-amber-500/10 to-orange-500/10",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    hoverBorder: "hover:border-amber-200/80",
    hoverShadow: "hover:shadow-amber-50",
  },
  {
    icon: Shield,
    title: "Marca Propia",
    description:
      "Personalizá tu página con tu logo, fotos y colores. Tu marca, tu identidad.",
    gradient: "from-emerald-500/10 to-teal-500/10",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    hoverBorder: "hover:border-emerald-200/80",
    hoverShadow: "hover:shadow-emerald-50",
  },
];

const plans = [
  {
    name: "Emprendedor",
    tagline: "Para quienes recién empiezan.",
    price: "Gratis",
    priceUnit: null,
    featured: false,
    features: [
      "Agenda online",
      "Link público de reservas",
      "Panel de administración básico",
      "Soporte por email",
    ],
    cta: "Comenzar Gratis",
    href: "/registro?plan=emprendedor",
  },
  {
    name: "Profesional",
    tagline: "Potenciá tus reservas al máximo.",
    price: "$9.999",
    priceUnit: "/mes",
    featured: true,
    features: [
      "Bot de WhatsApp 24/7",
      "Recordatorios automáticos",
      "Gestión de múltiples empleados",
      "Soporte prioritario",
    ],
    cta: "Elegir Profesional",
    href: "/registro?plan=profesional",
  },
  {
    name: "Elite",
    tagline: "Para franquicias y grandes marcas.",
    price: "$19.999",
    priceUnit: "/mes",
    featured: false,
    features: [
      "Marca Blanca (Tu logo y colores)",
      "Dominio personalizado",
      "Análisis y reportes avanzados",
      "Asesor de cuenta dedicado",
    ],
    cta: "Elegir Elite",
    href: "/registro?plan=elite",
  },
];

const logosRow = [
  "Barber Club", "LaVida Spa", "Studio Cut", "Nails Pro", "Elite Barber",
  "Urban Groom", "Bliss Studio", "Corte & Style",
];

// ─── Mock UI del producto ──────────────────────────────────────────────────────

function ProductMock() {
  const slots = [
    { time: "09:00", name: "Martín G.", service: "Corte + Barba", status: "confirmed" },
    { time: "10:30", name: "Ana R.", service: "Coloración", status: "confirmed" },
    { time: "11:00", name: "Disponible", service: "", status: "open" },
    { time: "12:00", name: "Lucas P.", service: "Corte", status: "pending" },
  ];
  return (
    <div className="relative w-full max-w-2xl mx-auto mt-16 select-none">
      {/* Glow detrás */}
      <div
        className="absolute inset-0 -z-10 rounded-3xl blur-3xl opacity-30"
        style={{ background: "linear-gradient(135deg,#6366f1,#a78bfa)" }}
      />

      {/* Ventana del app */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-2xl shadow-slate-200/60 overflow-hidden">
        {/* Barra superior */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <span className="w-3 h-3 rounded-full bg-red-400/70" />
          <span className="w-3 h-3 rounded-full bg-amber-400/70" />
          <span className="w-3 h-3 rounded-full bg-emerald-400/70" />
          <div className="flex-1 mx-4 h-6 bg-white border border-slate-200 rounded-full flex items-center px-3 gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[0.65rem] text-slate-400 font-medium">turnero.pro/tu-negocio</span>
          </div>
        </div>

        {/* Contenido del mock */}
        <div className="grid grid-cols-5 divide-x divide-slate-100">
          {/* Sidebar */}
          <div className="col-span-1 p-4 bg-slate-50/40 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <span className="text-[0.65rem] font-bold text-slate-900 leading-tight">Turnero<br/>Pro</span>
            </div>
            {["Agenda", "Clientes", "Servicios", "Reportes"].map((item, i) => (
              <div
                key={item}
                className={`text-[0.65rem] font-medium px-2 py-1.5 rounded-lg ${
                  i === 0
                    ? "bg-indigo-600 text-white"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {item}
              </div>
            ))}
          </div>

          {/* Main */}
          <div className="col-span-4 p-5 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[0.7rem] font-bold text-slate-900">Lunes 14 · Abril</p>
                <p className="text-[0.6rem] text-slate-400">4 turnos agendados</p>
              </div>
              <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[0.55rem] font-bold text-emerald-700">EN LÍNEA</span>
              </div>
            </div>

            {slots.map((slot) => (
              <div
                key={slot.time}
                className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                  slot.status === "open"
                    ? "border-dashed border-slate-200 bg-slate-50/50"
                    : slot.status === "pending"
                    ? "border-amber-100 bg-amber-50/40"
                    : "border-slate-100 bg-white"
                }`}
              >
                <span className="text-[0.6rem] font-bold text-slate-400 w-8 shrink-0">{slot.time}</span>
                {slot.status === "open" ? (
                  <span className="text-[0.6rem] text-slate-300 italic">Slot disponible</span>
                ) : (
                  <>
                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <span className="text-[0.5rem] font-bold text-indigo-700">
                        {slot.name[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[0.62rem] font-semibold text-slate-800 truncate">{slot.name}</p>
                      <p className="text-[0.55rem] text-slate-400 truncate">{slot.service}</p>
                    </div>
                    <span className={`text-[0.5rem] font-bold px-1.5 py-0.5 rounded-full ${
                      slot.status === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {slot.status === "pending" ? "Pendiente" : "Confirmado"}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating notification */}
      <div className="absolute -bottom-4 -right-4 bg-white border border-slate-200 rounded-2xl shadow-lg shadow-slate-200/60 px-4 py-3 flex items-center gap-3 animate-float">
        <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-[0.65rem] font-bold text-slate-900">Nuevo turno</p>
          <p className="text-[0.6rem] text-slate-400">Carlos S. · 15:00hs</p>
        </div>
      </div>

      {/* Floating rating */}
      <div className="absolute -top-4 -left-4 bg-white border border-slate-200 rounded-2xl shadow-lg shadow-slate-200/60 px-4 py-3 flex items-center gap-2 animate-float-slow">
        <div className="flex gap-0.5">
          {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
        </div>
        <p className="text-[0.65rem] font-bold text-slate-900">4.9 · 312 reseñas</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-white antialiased">

      {/* Radial glow fijo */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 50% -5%, rgba(99,102,241,0.07) 0%, transparent 65%)",
        }}
      />

      {/* ══════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100/80 bg-white/70 backdrop-blur-md">
        <div className="container mx-auto px-6 h-[3.75rem] flex items-center justify-between max-w-6xl">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-indigo-600 p-1.5 rounded-xl shadow-sm shadow-indigo-300/40 group-hover:shadow-indigo-300/60 transition-shadow duration-200">
              <Calendar className="w-[1.05rem] h-[1.05rem] text-white" />
            </div>
            <span className="font-extrabold text-[1.05rem] tracking-tight text-slate-900">
              Turnero<span className="text-indigo-600">Pro</span>
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1.5">
            <Link
              href="/login"
              className="hidden sm:inline-flex h-9 items-center px-3.5 text-sm font-medium text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100/80 transition-all duration-150"
            >
              Iniciar Sesión
            </Link>
            <Button
              className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm shadow-indigo-300/40 text-sm font-semibold transition-all duration-200 hover:shadow-indigo-300/60 hover:shadow-md"
              asChild
            >
              <Link href="/crear-negocio">Comenzar Gratis</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-grow overflow-x-hidden">

        {/* ══════════════════════════════════════════
            HERO
        ══════════════════════════════════════════ */}
        <section className="relative pt-24 pb-16 px-6">
          <div className="container mx-auto max-w-5xl">

            {/* Badge */}
            <div className="flex justify-center mb-7">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-600 tracking-wide">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Ideal para Barberías · Peluquerías · Spas
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 ml-0.5" />
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-center text-5xl md:text-[4rem] lg:text-[4.5rem] font-extrabold tracking-tight text-slate-900 leading-[1.06] mb-6">
              Gestioná tus turnos{" "}
              <br className="hidden sm:block" />
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #c084fc 100%)",
                  WebkitBackgroundClip: "text",
                }}
              >
                en piloto automático
              </span>
              .
            </h1>

            {/* Subtítulo */}
            <p className="text-center text-[1.05rem] md:text-lg text-slate-500 max-w-xl mx-auto leading-relaxed mb-10">
              Dejá de responder mensajes a deshora. Tus clientes reservan
              solos en segundos, vos te enfocás en tu arte.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
              <Button
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-base bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-xl shadow-indigo-200/70 transition-all duration-200 hover:shadow-2xl hover:shadow-indigo-200/80 hover:-translate-y-0.5"
                asChild
              >
                <Link href="/crear-negocio">
                  Comenzar Gratis
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-14 px-8 text-base border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-semibold rounded-2xl transition-all duration-200"
                asChild
              >
                <Link href="/peluqueria-test">Ver Demo en vivo</Link>
              </Button>
            </div>

            {/* Trust metrics */}
            <div className="flex items-center justify-center gap-8 sm:gap-12 mb-2">
              {[
                { value: "+2.000", label: "negocios activos" },
                { value: "4.9 ★", label: "valoración media" },
                { value: "Sin comisiones", label: "por reserva" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-xl font-extrabold text-slate-900 tracking-tight">{s.value}</p>
                  <p className="text-[0.72rem] text-slate-400 font-medium mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Product mock UI */}
            <ProductMock />
          </div>
        </section>

        {/* ══════════════════════════════════════════
            LOGOS / SOCIAL PROOF STRIP
        ══════════════════════════════════════════ */}
        <div className="border-y border-slate-100 py-5 overflow-hidden bg-slate-50/60">
          <div className="flex items-center gap-2 mb-2.5 justify-center">
            <p className="text-[0.7rem] font-bold tracking-widest text-slate-400 uppercase">
              Confían en nosotros
            </p>
          </div>
          <div className="relative flex overflow-hidden">
            <div className="flex gap-10 items-center animate-marquee whitespace-nowrap">
              {[...logosRow, ...logosRow].map((name, i) => (
                <span
                  key={i}
                  className="text-sm font-bold text-slate-300 px-3 shrink-0"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            FEATURES
        ══════════════════════════════════════════ */}
        <section className="py-28 px-6 bg-white">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center max-w-lg mx-auto mb-16">
              <p className="text-[0.7rem] font-bold tracking-widest text-indigo-500 uppercase mb-4">
                ¿Por qué TurneroPro?
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Todo lo que necesitás,
                <br />
                <span className="text-slate-400 font-semibold">sin complicaciones.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {features.map(({ icon: Icon, title, description, iconBg, iconColor, hoverBorder, hoverShadow }) => (
                <div
                  key={title}
                  className={`group bg-white border border-slate-100 rounded-3xl p-8 flex flex-col gap-6 cursor-default transition-all duration-300 ${hoverBorder} hover:shadow-xl ${hoverShadow} hover:-translate-y-1`}
                >
                  <div className={`w-11 h-11 ${iconBg} rounded-2xl flex items-center justify-center ${iconColor} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="text-[1rem] font-bold text-slate-900 mb-2 tracking-tight">
                      {title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            PASO A PASO (HOW IT WORKS)
        ══════════════════════════════════════════ */}
        <section className="py-28 px-6 bg-slate-50/70 border-y border-slate-100">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center max-w-lg mx-auto mb-16">
              <p className="text-[0.7rem] font-bold tracking-widest text-indigo-500 uppercase mb-4">
                En 3 pasos
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                Listo en menos de 5 minutos.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { num: "01", title: "Creá tu negocio", desc: "Registrate, ponele nombre, cargá tus servicios y horarios disponibles." },
                { num: "02", title: "Compartí el link", desc: "Enviá tu link único a tus clientes por WhatsApp, Instagram o donde quieras." },
                { num: "03", title: "Recibí turnos solo", desc: "El sistema gestiona todo automáticamente. Vos solo aparecés a trabajar." },
              ].map((step) => (
                <div key={step.num} className="flex flex-col gap-4">
                  <span className="text-5xl font-black text-slate-100 tracking-tighter leading-none">
                    {step.num}
                  </span>
                  <div>
                    <h3 className="text-[1rem] font-bold text-slate-900 mb-1.5 tracking-tight">{step.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            PRICING
        ══════════════════════════════════════════ */}
        <section className="py-28 px-6 bg-white" id="precios">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center max-w-lg mx-auto mb-16">
              <p className="text-[0.7rem] font-bold tracking-widest text-indigo-500 uppercase mb-4">
                Precios
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
                Planes simples y transparentes
              </h2>
              <p className="text-sm text-slate-500">
                Elegí el que se adapta a tu negocio. Cambiá o cancelá cuando quieras.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`relative flex flex-col h-full overflow-visible transition-all duration-200 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/20 text-slate-900 ${
                    plan.featured
                      ? "border-2 border-indigo-600 shadow-2xl shadow-indigo-100/80 md:scale-[1.04] z-10"
                      : "shadow-sm hover:shadow-md"
                  }`}
                >
                  {plan.featured && (
                    <div className="absolute -top-4 inset-x-0 flex justify-center">
                      <span className="bg-indigo-600 text-white text-[0.65rem] font-bold uppercase tracking-widest py-1 px-4 rounded-full shadow-lg shadow-indigo-400/30">
                        Más Popular
                      </span>
                    </div>
                  )}

                  <CardHeader className={`pb-0 ${plan.featured ? "pt-9" : ""}`}>
                    <p className={`text-base font-bold tracking-tight ${plan.featured ? "text-indigo-900" : "text-slate-900"}`}>
                      {plan.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{plan.tagline}</p>
                    <div className="mt-5 flex items-baseline gap-1">
                      <span className={`text-4xl font-black tracking-tight ${plan.featured ? "text-indigo-700" : "text-slate-900"}`}>
                        {plan.price}
                      </span>
                      {plan.priceUnit && (
                        <span className="text-xs text-slate-400 font-medium">{plan.priceUnit}</span>
                      )}
                    </div>
                    <div className="mt-5 border-t border-slate-100 pt-5" />
                  </CardHeader>

                  <CardContent className="flex-1 pt-0 space-y-2.5">
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5">
                        <CheckCircle2
                          className={`w-4 h-4 mt-0.5 shrink-0 ${plan.featured ? "text-indigo-500" : "text-slate-300"}`}
                        />
                        <span className={`text-sm ${plan.featured ? "text-slate-700 font-medium" : "text-slate-600"}`}>
                          {feat}
                        </span>
                      </div>
                    ))}
                  </CardContent>

                  <CardFooter className="pt-6">
                    <Button
                      className={`w-full h-11 rounded-xl text-sm font-semibold transition-all duration-150 ${
                        plan.featured
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-300/40"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                      variant={plan.featured ? "default" : "outline"}
                      asChild
                    >
                      <Link href={plan.href}>{plan.cta}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Reassurance */}
            <div className="mt-10 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Sin tarjeta de crédito · Cancelá cuando quieras · Soporte en español</span>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            CTA FINAL
        ══════════════════════════════════════════ */}
        <section className="py-28 px-6">
          <div className="container mx-auto max-w-3xl">
            {/* Card de CTA */}
            <div
              className="relative rounded-3xl overflow-hidden p-12 text-center"
              style={{
                background:
                  "linear-gradient(135deg, #6366f1 0%, #7c3aed 60%, #a78bfa 100%)",
              }}
            >
              {/* Dots pattern overlay */}
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
              <div className="relative z-10">
                <p className="text-[0.7rem] font-bold tracking-widest text-white/60 uppercase mb-4">
                  Empezá hoy · Sin costo
                </p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
                  Tu agenda llena, siempre.
                </h2>
                <p className="text-white/70 text-sm mb-10 max-w-md mx-auto leading-relaxed">
                  Configurá tu negocio en menos de 5 minutos y empezá a recibir
                  turnos hoy mismo.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-14 px-8 bg-white text-indigo-700 hover:bg-white/90 font-semibold text-base rounded-2xl shadow-xl shadow-indigo-900/30 transition-all duration-200 hover:-translate-y-0.5"
                    asChild
                  >
                    <Link href="/crear-negocio">
                      Crear mi negocio gratis
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto h-14 px-8 border-white/30 bg-white/10 text-white hover:bg-white/20 font-semibold text-base rounded-2xl backdrop-blur-sm transition-all duration-200"
                    asChild
                  >
                    <Link href="/peluqueria-test">Ver Demo</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="border-t border-slate-100 bg-white py-10">
        <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-5 text-slate-400 text-sm">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-indigo-600 p-1 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-extrabold text-slate-700 tracking-tight text-sm">
              Turnero<span className="text-indigo-600">Pro</span>
            </span>
          </Link>

          <p>© {new Date().getFullYear()} TurneroPro · Todos los derechos reservados.</p>

          <div className="flex gap-6">
            {[
              { href: "/terminos", label: "Términos" },
              { href: "/privacidad", label: "Privacidad" },
              { href: "/contacto", label: "Contacto" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-slate-700 transition-colors duration-150">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
