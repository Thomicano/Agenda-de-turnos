"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Trash2, Plus, Smartphone, Settings,
  MapPin, Phone, Mail, Clock, Scissors, Stethoscope,
  Car, Sparkles, ArrowRight, ArrowLeft, Upload, Globe,
  CheckCircle2, X, Trophy, HeartPulse, Store
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { generateSlug } from "@/utils/slugify";

// --- TIPOS Y CONFIG ---
type Servicio = { nombre: string; precio: string; duracion: string; };
type DiaHorario = { dia: string; activo: boolean; desde: string; hasta: string; };

const RUBROS = [
  {
    id: 'barberia',
    label: 'Peluquería / Barbería',
    icon: Scissors,
    placeholderServicio: 'Ej: Corte Clásico',
    labelServicios: 'Tus Servicios de Peluqueria/Barberia',
    labelStep2: 'Configuración de servicios de peluqueria/barberia'
  },
  {
    id: 'salud',
    label: 'Salud / Consultorio',
    icon: Stethoscope,
    placeholderServicio: 'Ej: Consulta Médica',
    labelServicios: 'Prestaciones Médicas',
    labelStep2: 'Configuración de Salud'
  },
  {
    id: 'deportes',
    label: 'Canchas / Deportes',
    icon: Trophy,
    placeholderServicio: 'Ej: Alquiler Cancha 5',
    labelServicios: 'Tus Canchas o Espacios',
    labelStep2: 'Gestión de canchas'
  },
  {
    id: 'estetica',
    label: 'Estética / Spa',
    icon: Sparkles,
    placeholderServicio: 'Ej: Limpieza de Cutis',
    labelServicios: 'Tratamientos Disponibles',
    labelStep2: 'Configuración de Bienestar'
  }
];

const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function OnboardingNegocioPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // --- CONTROL DEL STEPPER ---
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // --- ESTADOS (TODOS INTEGRADOS) ---
  const [nombreNegocio, setNombreNegocio] = useState("");
  const [rubro, setRubro] = useState(RUBROS[0].id); // Guardamos solo el ID (string)
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [email, setEmail] = useState("");

  const [duracionTurno, setDuracionTurno] = useState("");
  const [intervaloTurno, setIntervaloTurno] = useState("");
  const [intervaloAutomatico, setIntervaloAutomatico] = useState(true);

  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string>("");

  const [servicios, setServicios] = useState<Servicio[]>([{ nombre: "", precio: "", duracion: "30" }]);
  const [horariosDia, setHorariosDia] = useState<DiaHorario[]>(
    DIAS_SEMANA.map(d => ({ dia: d, activo: !["Sábado", "Domingo"].includes(d), desde: "09:00", hasta: "18:00" }))
  );

  const [loading, setLoading] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [finalSlug, setFinalSlug] = useState("");

  //Helper para obtener los textos del rubro actual
  const rubroActual = RUBROS.find(r => r.id === rubro) || RUBROS[0];

  // --- LÓGICA DE INTERVALOS ---
  const calcularIntervaloAutomatico = (duracion: string) => {
    const duracionNum = parseInt(duracion);
    if (!duracionNum) return "0";
    return Math.max(5, Math.ceil(duracionNum * 0.1)).toString();
  };

  const handleDuracionChange = (valor: string) => {
    setDuracionTurno(valor);
    if (intervaloAutomatico && valor) {
      setIntervaloTurno(calcularIntervaloAutomatico(valor));
    }
  };

  // --- HANDLERS GENERALES ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) { toast.error('Solo JPG, PNG o WEBP'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Máximo 5MB'); return; }

    setImagenFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagenPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const agregarServicio = () => setServicios([...servicios, { nombre: "", precio: "", duracion: "30" }]);
  const eliminarServicio = (index: number) => setServicios(servicios.filter((_, i) => i !== index));
  const actualizarServicio = (index: number, campo: keyof Servicio, valor: string) => {
    const copia = [...servicios]; copia[index][campo] = valor; setServicios(copia);
  };

  const toggleDia = (index: number) => {
    const copia = [...horariosDia]; copia[index].activo = !copia[index].activo; setHorariosDia(copia);
  };

  // --- NAVEGACIÓN DEL STEPPER ---
  const nextStep = () => {
    if (step === 1 && (!nombreNegocio || !email || !telefono)) {
      toast.error("Completá los campos obligatorios (*)"); return;
    }
    if (step === 2 && (!duracionTurno || servicios.some(s => !s.nombre))) {
      toast.error("Completá los servicios y la duración"); return;
    }
    setStep(s => Math.min(s + 1, totalSteps));
  };
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  // --- SUBMIT FINAL ---
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const slugBase = generateSlug(nombreNegocio);

      // 🛡️ VALIDACIÓN DE UNICIDAD
      const { data: existe } = await supabase
        .from("negocios")
        .select("slug")
        .eq("slug", slugBase)
        .maybeSingle();

      if (existe) {
        toast.error("Esta URL ya está ocupada. Probá con otro nombre.");
        setLoading(false); // Importante cortar el loading aquí
        return;
      }

      const uniqueSlug = slugBase;
      let logoUrl = "";

      // 🟢 Lógica de Imagen (Cerrando bien los bloques)
      if (imagenFile) {
        // Aquí irá la lógica del bucket en el futuro
        // logoUrl = await subirLogo(imagenFile); 
      }

      // 🟢 Insertar Negocio (Uno solo, bien configurado)
      const { data: negocioData, error: negocioError } = await supabase
        .from('negocios')
        .insert([{
          owner_id: user?.id,
          nombre: nombreNegocio,
          slug: uniqueSlug,
          rubro,
          telefono,
          direccion,
          email,
          logo_url: logoUrl,
          duracion_turno: parseInt(duracionTurno),
          intervalo_turno: parseInt(intervaloTurno || "0"),
          settings: { tema: { primary: "#00FF9F", dark_mode: true } }
        }])
        .select()
        .single();

      if (negocioError) throw negocioError;

      // 🟢 Insertar Servicios
      const serviciosAInsertar = servicios
        .filter(s => s.nombre.trim())
        .map(s => ({
          negocio_id: negocioData.id,
          nombre: s.nombre,
          precio: parseFloat(s.precio || "0"),
          duracion_min: parseInt(s.duracion || "30")
        }));

      if (serviciosAInsertar.length > 0) {
        const { error: servError } = await supabase.from('servicios').insert(serviciosAInsertar);
        if (servError) throw servError;
      }

      // 🟢 Finalización
      setFinalSlug(uniqueSlug);
      setMostrarExito(true);
      toast.success("¡Negocio creado con éxito!");

    } catch (error: any) {
      toast.error(error.message || "Ocurrió un error.");
    } finally {
      setLoading(false);
    }
  };
  if (authLoading) return <div className="min-h-screen bg-[#19143c] flex items-center justify-center"><Loader2 className="animate-spin text-[#00FF9F]" /></div>;
  if (!user) return <div className="min-h-screen bg-[#19143c] text-white flex items-center justify-center">Iniciá sesión primero.</div>;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[#f8fafc] flex flex-col lg:flex-row overflow-hidden font-sans">

      {/* ── IZQUIERDA: FORMULARIO (STEPPER) ── */}
      <div className="w-full lg:w-[55%] h-screen overflow-y-auto p-6 md:p-12 custom-scrollbar flex flex-col">

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-[#00FF9F]' : 'bg-white/10'}`} />
          ))}
        </div>

        <div className="flex-1 max-w-xl mx-auto lg:mx-0 w-full pb-20">
          <AnimatePresence mode="wait">

            {/* --- PASO 1: IDENTIDAD --- */}
            {step === 1 && (
              <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-8">
                <header>
                  {/* 🟢 Título dinámico para el Paso 1 */}
                  <h1 className="text-4xl font-black uppercase tracking-tighter italic">Informacion<span className="text-[#00FF9F]">Basica</span></h1>
                  <p className="text-slate-400 text-[10px] mt-2 font-bold uppercase tracking-widest">Paso 1 de 3 / Información Básica</p>
                </header>

                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nombre del negocio *</label>
                    <input className="input-onboarding" value={nombreNegocio} onChange={e => setNombreNegocio(e.target.value)} placeholder="Ej: Barbería La Costa" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Teléfono *</label>
                      <input className="input-onboarding" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="+54 9 11..." type="tel" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Email *</label>
                      <input className="input-onboarding" value={email} onChange={e => setEmail(e.target.value)} placeholder="contacto@empresa.com" type="email" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Dirección Física</label>
                    <input className="input-onboarding" value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Av. Corrientes 1234" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Contenedor del Logo */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Logo</label>
                      <label className="relative w-full h-40 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#00FF9F]/50 transition-all overflow-hidden group">
                        {imagenPreview ? (
                          <img src={imagenPreview} className="absolute inset-0 w-full h-full object-cover" alt="Logo preview" />
                        ) : (
                          <div className="text-center z-10 group-hover:scale-105 transition-transform">
                            <Upload className="mx-auto mb-2 text-slate-500" size={24} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Subir Logo</span>
                          </div>
                        )}
                        <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                      </label>
                    </div>

                    {/* Contenedor de Rubros */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Rubro Principal</label>
                      <div className="h-40 space-y-2 overflow-y-auto no-scrollbar pr-1">
                        {RUBROS.map(r => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setRubro(r.id)}
                            className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-[10px] font-bold uppercase transition-all ${rubro === r.id ? 'border-[#00FF9F] bg-[#00FF9F]/10 text-[#00FF9F]' : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'}`}
                          >
                            {r.label} <r.icon size={16} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* --- PASO 2: SERVICIOS Y CONFIG --- */}
            {step === 2 && (
              <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-8">
                <header>
                  <h1 className="text-4xl font-black uppercase tracking-tighter italic">
                    {/* 🟢 Título dinámico por rubro: "Servicios" o "Recursos" */}
                    {rubroActual.id === 'deportes' ? 'Recursos' : 'Servicios'}<span className="text-[#00FF9F]">.Config</span>
                  </h1>
                  <p className="text-slate-400 text-[10px] mt-2 font-bold uppercase tracking-widest">
                    {/* 🟢 Label dinámico del rubro (Paso 2) */}
                    {rubroActual.labelStep2}
                  </p>
                </header>

                <div className="space-y-8">
                  {/* Tiempos */}
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Duración base (min) *</label>
                      <input type="number" className="w-full bg-transparent border-b border-white/20 pb-2 outline-none font-bold text-lg focus:border-[#00FF9F]" value={duracionTurno} onChange={e => handleDuracionChange(e.target.value)} placeholder="Ej: 30" />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <input type="checkbox" id="autoInt" checked={intervaloAutomatico} onChange={e => { setIntervaloAutomatico(e.target.checked); if (e.target.checked && duracionTurno) setIntervaloTurno(calcularIntervaloAutomatico(duracionTurno)); }} className="w-4 h-4 accent-[#00FF9F]" />
                      <label htmlFor="autoInt" className="text-[10px] font-bold text-slate-400 uppercase">Auto calcular descanso (10%)</label>
                    </div>

                    {!intervaloAutomatico && (
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Intervalo manual (min)</label>
                        <input type="number" className="w-full bg-transparent border-b border-white/20 pb-2 outline-none font-bold text-lg focus:border-[#00FF9F]" value={intervaloTurno} onChange={e => setIntervaloTurno(e.target.value)} placeholder="Ej: 5" />
                      </div>
                    )}

                    {intervaloAutomatico && duracionTurno && (
                      <p className="text-[10px] text-[#00FF9F] font-mono">Total bloque: {parseInt(duracionTurno) + parseInt(intervaloTurno || "0")} min</p>
                    )}
                  </div>

                  {/* Servicios con Layout de Tarjetas */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                      {/* 🟢 Label dinámico: "Tus Servicios", "Tus Canchas", etc. */}
                      {rubroActual.labelServicios}
                    </label>
                    {servicios.map((s, i) => (
                      <div key={i} className="flex flex-col sm:flex-row gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl items-center animate-in fade-in zoom-in-95">
                        <input
                          className="w-full sm:flex-[2] h-12 bg-black/20 border border-transparent rounded-xl px-4 text-sm font-bold outline-none focus:border-[#00FF9F] transition-all"
                          placeholder={rubroActual.placeholderServicio}
                          value={s.nombre}
                          onChange={e => actualizarServicio(i, 'nombre', e.target.value)}
                        />
                        <div className="flex w-full sm:w-auto gap-3">
                          <input
                            className="w-full sm:w-20 h-12 bg-black/20 border border-transparent rounded-xl px-2 text-center text-sm font-bold outline-none focus:border-[#00FF9F] transition-all"
                            placeholder="Min"
                            type="number"
                            value={s.duracion}
                            onChange={e => actualizarServicio(i, 'duracion', e.target.value)}
                          />
                          <input
                            className="w-full sm:w-24 h-12 bg-black/20 border border-transparent rounded-xl px-2 text-center text-sm font-bold outline-none focus:border-[#00FF9F] transition-all"
                            placeholder="$ Precio"
                            type="number"
                            value={s.precio}
                            onChange={e => actualizarServicio(i, 'precio', e.target.value)}
                          />
                          {servicios.length > 1 && (
                            <button type="button" onClick={() => eliminarServicio(i)} className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-colors">
                              <X size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    <button type="button" onClick={agregarServicio} className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:border-[#00FF9F] hover:text-[#00FF9F] hover:bg-[#00FF9F]/5 transition-all">
                      + Añadir otro
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* --- PASO 3: HORARIOS --- */}
            {step === 3 && (
              <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-8">
                <header>
                  <h1 className="text-4xl font-black uppercase tracking-tighter italic">Disponibilidad<span className="text-[#00FF9F]">Semanal</span></h1>
                  <p className="text-slate-400 text-[10px] mt-2 font-bold uppercase tracking-widest">Paso 3 de 3 / Días de atención</p>
                </header>

                <div className="space-y-2 max-h-[50vh] overflow-y-auto no-scrollbar pr-2">
                  {horariosDia.map((h, i) => (
                    <div key={h.dia} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${h.activo ? 'border-[#00FF9F]/40 bg-[#00FF9F]/5' : 'border-white/5 bg-white/5'}`}>
                      <input type="checkbox" checked={h.activo} onChange={() => toggleDia(i)} className="w-5 h-5 accent-[#00FF9F]" />
                      <span className="text-[11px] font-black uppercase w-20">{h.dia}</span>
                      {h.activo && (
                        <div className="flex-1 flex justify-end gap-2 text-[11px]">
                          <input type="time" value={h.desde} onChange={e => { const n = [...horariosDia]; n[i].desde = e.target.value; setHorariosDia(n); }} className="bg-[#19143c] border border-white/10 rounded-md px-2 py-1 outline-none font-mono" />
                          <span className="text-slate-600 self-center">→</span>
                          <input type="time" value={h.hasta} onChange={e => { const n = [...horariosDia]; n[i].hasta = e.target.value; setHorariosDia(n); }} className="bg-[#19143c] border border-white/10 rounded-md px-2 py-1 outline-none font-mono" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- BOTONERA --- */}
        <div className="flex gap-4 pt-6 border-t border-white/5 mt-auto">
          {step > 1 && (
            <button onClick={prevStep} className="h-16 px-8 rounded-2xl border border-white/10 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all">
              Atrás
            </button>
          )}
          <button
            onClick={step === 3 ? handleSubmit : nextStep}
            disabled={loading}
            className="flex-1 h-16 bg-[#00FF9F] text-[#19143c] rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:scale-[1.02] transition-all active:scale-95 shadow-[0_0_20px_rgba(0,255,159,0.3)] disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : step === 3 ? "Registrar Negocio" : "Siguiente"} <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* ── DERECHA: LIVE PREVIEW (ELÁSTICO Y CORREGIDO) ── */}
      <div className="hidden lg:flex flex-1 bg-[#120e2d] items-center justify-center relative border-l border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,255,159,0.05)_0%,transparent_70%)]" />

        <div className="relative w-[320px] h-[640px] bg-[#19143c] rounded-[3.5rem] border-[8px] border-[#251f5a] shadow-2xl overflow-hidden flex flex-col">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#251f5a] rounded-b-2xl z-20" />

          <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
            {/* Header Preview Elástico */}
            <div className="min-h-[12rem] bg-gradient-to-b from-[#00FF9F]/20 to-[#19143c] p-6 pt-12 flex flex-col justify-end">
              <AnimatePresence mode="popLayout">
                {imagenPreview && (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    src={imagenPreview}
                    className="w-16 h-16 rounded-2xl object-cover mb-4 border border-white/10 shadow-lg"
                  />
                )}
              </AnimatePresence>

              <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1 text-white break-words">
                {nombreNegocio || "Tu Marca"}
              </h3>

              <p className="text-[10px] font-black text-[#00FF9F] uppercase tracking-widest">
                {RUBROS.find(r => r.id === rubro)?.label || "Rubro"}
              </p>

              {direccion && (
                <p className="text-[9px] text-slate-400 mt-2 flex items-center gap-1.5 font-medium">
                  <MapPin size={12} className="text-[#00FF9F] flex-shrink-0" />
                  <span className="truncate">{direccion}</span>
                </p>
              )}
            </div>

            <div className="p-6 space-y-6">
              {/* Info Preview */}
              <div className="flex justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="text-center flex-1 border-r border-white/10">
                  <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Duración</p>
                  <p className="text-xs font-black text-white">{duracionTurno || "--"} min</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Intervalo</p>
                  <p className="text-xs font-black text-white">{intervaloTurno || "--"} min</p>
                </div>
              </div>

              {/* Servicios Preview */}
              <div className="space-y-3">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Servicios</p>

                {servicios.some(s => s.nombre.trim() !== "") ? (
                  servicios.filter(s => s.nombre.trim() !== "").map((s, i) => (
                    <div key={i} className="p-3.5 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center text-xs font-bold transition-all">
                      <span className="text-white truncate pr-2">{s.nombre}</span>
                      <span className="text-[#00FF9F] flex-shrink-0">${s.precio || "0"}</span>
                    </div>
                  ))
                ) : (
                  <div className="h-14 bg-white/5 rounded-xl border border-white/5 border-dashed flex items-center justify-center">
                    <span className="text-[9px] text-slate-600 uppercase font-bold">Aún no hay servicios</span>
                  </div>
                )}
              </div>

              {/* Dias Preview */}
              <div className="space-y-3">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Días Disponibles</p>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {horariosDia.filter(h => h.activo).length > 0 ? (
                    horariosDia.filter(h => h.activo).map((h, i) => (
                      <div key={i} className="flex-shrink-0 w-14 h-16 rounded-2xl border border-[#00FF9F]/30 bg-[#00FF9F]/5 flex flex-col items-center justify-center">
                        <span className="text-[9px] font-black text-[#00FF9F] uppercase">{h.dia.slice(0, 3)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="h-16 w-full bg-white/5 rounded-2xl border border-white/5 border-dashed flex items-center justify-center">
                      <span className="text-[9px] text-slate-600 uppercase font-bold">Sin horarios</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0 bg-[#19143c] z-10 relative shadow-[0_-20px_20px_-10px_rgba(25,20,60,0.9)]">
            <div className="w-full h-12 bg-[#00FF9F] rounded-xl flex items-center justify-center text-[#19143c] text-[10px] font-black uppercase tracking-widest opacity-90">
              Simular Reserva
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL EXITO --- */}
      {mostrarExito && (
        <div className="fixed inset-0 bg-[#0d0d1a]/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#19143c] border border-[#00FF9F]/20 p-8 rounded-[2.5rem] max-w-md w-full text-center shadow-[0_0_50px_rgba(0,255,159,0.1)] animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-[#00FF9F]/10 text-[#00FF9F] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(0,255,159,0.1)]">
              <CheckCircle2 size={40} />
            </div>

            <h2 className="text-3xl font-black uppercase italic text-white tracking-tighter mb-2">¡Negocio Online!</h2>
            <p className="text-slate-400 text-sm mb-8 font-medium">Tu Negocio digital ya está en marcha.</p>

            {/* 🚀 LINKS DINÁMICOS */}
            <div className="space-y-4 text-left mb-8">
              <div className="bg-black/30 p-4 rounded-2xl border border-white/5 group hover:border-[#00FF9F]/30 transition-colors">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Tu Link de Reservas</p>
                <p className="text-[#00FF9F] font-mono text-xs truncate">turnixapp.com/{finalSlug}</p>
              </div>

              <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Acceso Administrativo</p>
                <p className="text-white font-mono text-xs truncate">turnixapp.com/admin/{finalSlug}</p>
              </div>
            </div>

            <button
              onClick={() => router.push(`/admin/${finalSlug}`)}
              className="w-full h-14 bg-[#00FF9F] text-[#0d0d1a] rounded-2xl font-black uppercase tracking-widest shadow-[0_10px_20px_rgba(0,255,159,0.2)] hover:scale-[1.02] transition-transform"
            >
              Entrar al Panel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}