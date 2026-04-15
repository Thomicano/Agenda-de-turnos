"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Store, Users, Clock, Camera, Plus, Trash2, Save, Loader2, Sparkles, ArrowRight, Share2, Save as SaveIcon } from "lucide-react";
import { toast } from "sonner";

type DiaConfig = {
  dia_semana: number;
  esta_abierto: boolean;
  hora_apertura: string;
  hora_cierre: string;
};

const NOMBRES_DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function AdminConfiguracionClient({ slug }: { slug: string }) {
  const [activeTab, setActiveTab] = useState<"general" | "staff" | "horarios" | "share">("general");
  const [negocio, setNegocio] = useState<any>(null);
  const [profesionales, setProfesionales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardandoIdentidad, setGuardandoIdentidad] = useState(false);
  const [mostrarFormProfesional, setMostrarFormProfesional] = useState(false);
  const [nuevoProfNombre, setNuevoProfNombre] = useState("");
  const [nuevoProfEsp, setNuevoProfEsp] = useState("");
  const [guardandoProfesional, setGuardandoProfesional] = useState(false);

  const [horarios, setHorarios] = useState<DiaConfig[]>(
    Array.from({ length: 7 }, (_, index) => ({
      dia_semana: index,
      esta_abierto: false,
      hora_apertura: "09:00",
      hora_cierre: "18:00",
    }))
  );

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      const { data: neg } = await supabase.from("negocios").select("*").eq("slug", slug).single();
      if (neg) {
        setNegocio(neg);
        if (neg.horarios && neg.horarios.length > 0) {
          // Si guardaste con la estructura nueva en el onboarding, lo seteamos directo:
          setHorarios(neg.horarios);
        }
        const { data: profs } = await supabase.from("profesionales").select("*").eq("negocio_id", neg.id);
        if (profs) setProfesionales(profs);
      }
      setLoading(false);
    }
    loadData();
  }, [slug, supabase]);

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !negocio?.id) return;
    const fileExt = file.name.split('.').pop();
    const fileName = `${negocio.id}/${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('logos-negocios').upload(fileName, file, { upsert: true });
    if (uploadError) return toast.error("Error al subir logo");
    const { data: { publicUrl } } = supabase.storage.from('logos-negocios').getPublicUrl(fileName);
    const { error: dbError } = await supabase.from('negocios').update({ logo_url: publicUrl }).eq('id', negocio.id);
    if (!dbError) {
      setNegocio({ ...negocio, logo_url: publicUrl });
      toast.success("Logo actualizado");
    }
  };

  const guardarIdentidad = async () => {
    if (!negocio?.id) return;
    setGuardandoIdentidad(true);
    const { error } = await supabase.from('negocios').update({
      nombre: negocio.nombre,
      direccion: negocio.direccion,
      telefono: negocio.telefono,
      email: negocio.email
    }).eq('id', negocio.id);
    setGuardandoIdentidad(false);
    error ? toast.error("Error") : toast.success("Identidad actualizada");
  };

  const agregarProfesional = async () => {
    if (!negocio?.id || !nuevoProfNombre.trim()) return;
    setGuardandoProfesional(true);
    const { data, error } = await supabase.from('profesionales').insert({
      negocio_id: negocio.id,
      nombre: nuevoProfNombre,
      especialidad: nuevoProfEsp
    }).select().single();
    setGuardandoProfesional(false);
    if (!error) {
      setProfesionales([...profesionales, data]);
      setMostrarFormProfesional(false);
      setNuevoProfNombre(""); setNuevoProfEsp("");
      toast.success("Profesional añadido");
    }
  };

  const eliminarProfesional = async (id: string) => {
    if (!confirm("¿Eliminar?")) return;
    const { error } = await supabase.from("profesionales").delete().eq("id", id);
    if (!error) setProfesionales(profesionales.filter(p => p.id !== id));
  };

  const actualizarDia = (dia_semana: number, campo: keyof DiaConfig, valor: any) => {
    setHorarios((prev) => prev.map((h) => (h.dia_semana === dia_semana ? { ...h, [campo]: valor } : h)));
  };

  const guardarHorarios = async () => {
    if (!negocio?.id) return;
    setGuardando(true);

    // 1️⃣ Preparamos el payload (el array que se guardará en la columna JSONB)
    const payload = horarios.map((h) => ({
      dia_semana: h.dia_semana, // Mantenemos el índice 0-6
      esta_abierto: h.esta_abierto,
      // Aseguramos formato HH:mm:00
      hora_apertura: h.hora_apertura.length === 5 ? `${h.hora_apertura}:00` : h.hora_apertura,
      hora_cierre: h.hora_cierre.length === 5 ? `${h.hora_cierre}:00` : h.hora_cierre
    }));

    // 2️⃣ CAMBIO CLAVE: Actualizamos el registro del negocio, no una tabla aparte
    // Usamos .update() en la tabla 'negocios' filtrando por el ID actual
    const { error } = await supabase
      .from("negocios")
      .update({
        horarios: payload // Actualizamos la columna JSONB con el nuevo array
      })
      .eq("id", negocio.id);

    setGuardando(false);

    if (error) {
      console.error("❌ Error de Supabase:", error);
      toast.error("Fallo al guardar los cambios");
    } else {
      toast.success("✨ Horarios sincronizados en tu Negocio");
    }
  };

  if (loading) return <div className="p-10 text-center text-[#00FF9F] animate-pulse font-black uppercase">Sincronizando...</div>;
  // 🟢 Lógica dinámica para nombres de UI
  const labelStaff = negocio?.rubro === 'deportes' ? "Recursos" : "Equipo";
  const iconStaff = negocio?.rubro === 'deportes' ? Store : Users; // Store puede simular una cancha/local  
  const esDeporte = negocio?.rubro === 'deportes';

  const labels = {
    staffTab: esDeporte ? "Recursos" : "Equipo",
    staffTitle: esDeporte ? "GESTIÓN DE CANCHAS" : "EQUIPO PROFESIONAL",
    addButton: esDeporte ? "AGREGAR CANCHA" : "AGREGAR MIEMBRO",
    placeholderNombre: esDeporte ? "Nombre de la cancha (Ej: Cancha 5)" : "Nombre del profesional",
    placeholderExtra: esDeporte ? "Tipo (Ej: Sintético / Techada)" : "Especialidad",
    cardSub: esDeporte ? "Tipo de suelo/espacio" : "Especialidad"
  };
  return (
    <AdminPageLayout title="Configuración" subtitle="Personalizá el ADN de tu negocio">

      {/* NAVEGACIÓN DE TABS - CYBER STYLE */}
      <div className="flex gap-2 p-1.5 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl mb-10 w-fit">
        {[
          { id: "general", label: "Identidad", icon: Store },
          { id: "share", label: "Difusión", icon: Share2 },
          { id: "staff", label: labelStaff, icon: iconStaff },
          { id: "horarios", label: "Horarios", icon: Clock },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 ${activeTab === tab.id
              ? "bg-[#00FF9F] text-black font-black shadow-[0_0_20px_rgba(0,255,159,0.3)]"
              : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
          >
            <tab.icon size={18} />
            <span className="text-xs uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>

          {/* TAB: IDENTIDAD */}
          {activeTab === "general" && (
            <Card className="bg-white/5 border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <CardContent className="pt-8 space-y-8">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">
                    Rubro del Negocio
                  </label>
                  <select
                    value={negocio?.rubro || ""}
                    onChange={(e) => setNegocio({ ...negocio, rubro: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 text-white h-12 rounded-xl px-4 outline-none focus:border-[#00FF9F]/50 transition-all font-bold"
                  >
                    <option value="" disabled className="bg-[#131A2A]">Seleccioná un rubro</option>
                    <option value="barberia" className="bg-[#131A2A]">Peluquería / Barbería</option>
                    <option value="estetica" className="bg-[#131A2A]">Estética / Spa</option>
                    <option value="salud" className="bg-[#131A2A]">Salud / Consultorio</option>
                    <option value="deportes" className="bg-[#131A2A]">Canchas / Deportes</option>
                    <option value="gastronomia" className="bg-[#131A2A]">Gastronomía / Reservas</option>
                    <option value="otros" className="bg-[#131A2A]">Otros</option>
                  </select>
                  <p className="text-[9px] text-slate-500 italic ml-2 mt-1">
                    * Cambiar el rubro ajustará automáticamente algunas funciones de tu panel.
                  </p>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-10">
                  <div className="relative h-32 w-32 rounded-full bg-black/40 border-2 border-dashed border-[#00FF9F]/30 overflow-hidden group shadow-[0_0_15px_rgba(0,255,159,0.1)]">
                    {negocio?.logo_url ? <img src={negocio.logo_url} className="h-full w-full object-cover" /> : <Camera className="m-auto mt-10 text-slate-500" />}
                    <label className="absolute inset-0 bg-[#00FF9F]/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all duration-300">
                      <Plus className="text-black mb-1" size={24} />
                      <span className="text-black text-[9px] font-black uppercase tracking-tighter">Cambiar</span>
                      <input type="file" className="hidden" onChange={handleUploadLogo} accept="image/*" />
                    </label>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Nombre Comercial</label>
                      <Input
                        className="bg-black/20 border-white/10 text-white focus:border-[#00FF9F]/50 h-12"
                        value={negocio?.nombre || ""}
                        onChange={(e) => setNegocio({ ...negocio, nombre: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Dirección Física</label>
                      <Input
                        className="bg-black/20 border-white/10 text-white focus:border-[#00FF9F]/50 h-12"
                        value={negocio?.direccion || ""}
                        onChange={(e) => setNegocio({ ...negocio, direccion: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">WhatsApp / Tel</label>
                      <Input
                        className="bg-black/20 border-white/10 text-white focus:border-[#00FF9F]/50 h-12"
                        value={negocio?.telefono || ""}
                        onChange={(e) => setNegocio({ ...negocio, telefono: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Email</label>
                      <Input
                        className="bg-black/20 border-white/10 text-white focus:border-[#00FF9F]/50 h-12"
                        value={negocio?.email || ""}
                        onChange={(e) => setNegocio({ ...negocio, email: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={guardarIdentidad} disabled={guardandoIdentidad} className="w-full bg-gradient-to-r from-[#00FF9F] to-[#008080] text-black font-black h-12 rounded-xl shadow-lg shadow-[#00FF9F]/10">
                  {guardandoIdentidad ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={18} />}
                  GUARDAR CONFIGURACIÓN
                </Button>
              </CardContent>
            </Card>
          )}
          {activeTab === "share" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card className="bg-white/5 border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <CardContent className="pt-8 space-y-8">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-[#00FF9F]/10 rounded-2xl text-[#00FF9F]">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Compartí tu Negocio</h3>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Copiá los links para tus redes sociales</p>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    {/* Link de Reservas */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Página de Reservas (Instagram / WhatsApp)</label>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-black/40 border border-white/10 px-4 py-3 rounded-xl font-mono text-sm text-[#00FF9F] truncate">
                          {typeof window !== 'undefined' ? `${window.location.origin}/${negocio?.slug}` : ''}
                        </div>
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/${negocio?.slug}`);
                            toast.success("¡Link de cliente copiado!");
                          }}
                          className="bg-white/5 hover:bg-[#00FF9F]/20 border border-white/10 text-white rounded-xl px-6"
                        >
                          COPIAR
                        </Button>
                      </div>
                    </div>

                    {/* Link de Admin */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Acceso Directo al Panel</label>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-black/40 border border-white/10 px-4 py-3 rounded-xl font-mono text-xs text-slate-400 truncate">
                          {typeof window !== 'undefined' ? `${window.location.origin}/admin/${negocio?.slug}` : ''}
                        </div>
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/admin/${negocio?.slug}`);
                            toast.success("¡Link de admin copiado!");
                          }}
                          className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 rounded-xl px-6"
                        >
                          COPIAR
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          {/* TAB: STAFF */}
          {activeTab === "staff" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-white flex items-center gap-2 italic">
                  <Users className="text-[#00FF9F]" />
                  {labels.staffTitle}
                </h3>
                <Button
                  onClick={() => setMostrarFormProfesional(!mostrarFormProfesional)}
                  className="bg-white/5 border border-white/10 hover:bg-[#00FF9F]/10 text-[#00FF9F] rounded-full px-6"
                >
                  <Plus size={18} className="mr-2" /> {labels.addButton}
                </Button>
              </div>

              {mostrarFormProfesional && (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  <Card className="bg-[#00FF9F]/5 border-[#00FF9F]/20 rounded-3xl">
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input placeholder={labels.placeholderNombre} className="bg-black/20 border-white/10" value={nuevoProfNombre} onChange={e => setNuevoProfNombre(e.target.value)} />
                      <Input placeholder={labels.placeholderExtra} className="bg-black/20 border-white/10" value={nuevoProfEsp} onChange={e => setNuevoProfEsp(e.target.value)} />
                      <div className="flex gap-2">
                        <Button className="flex-1 bg-[#00FF9F] text-black font-bold" onClick={agregarProfesional} disabled={guardandoProfesional}>
                          {guardandoProfesional ? <Loader2 className="animate-spin" /> : "CONFIRMAR"}
                        </Button>
                        <Button variant="ghost" className="text-white" onClick={() => setMostrarFormProfesional(false)}>X</Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {profesionales.map(p => (
                  <Card key={p.id} className="bg-white/5 border-white/10 rounded-3xl group hover:border-[#00FF9F]/50 transition-all duration-500">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#00FF9F] to-[#008080] flex items-center justify-center text-black font-black text-2xl mb-4 shadow-lg shadow-[#00FF9F]/20">
                        {p.nombre[0]?.toUpperCase()}
                      </div>
                      <p className="font-black text-white uppercase tracking-tighter text-lg">{p.nombre}</p>
                      <p className="text-xs text-[#00FF9F] font-bold uppercase tracking-widest mt-1 opacity-70">{p.especialidad}</p>
                      <Button variant="ghost" className="mt-4 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => eliminarProfesional(p.id)}>
                        <Trash2 size={18} />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TAB: HORARIOS */}
          {activeTab === "horarios" && (
            <Card className="bg-white/5 border-white/10 rounded-3xl shadow-2xl overflow-hidden">
              <CardHeader className=" border-b border-white/10">
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="text-[#00FF9F]" /> DISPONIBILIDAD HORARIA
                </CardTitle>
                <CardDescription className="text-slate-400">Definí los bloques de tiempo en los que tus clientes pueden reservar.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                {horarios.map((dia) => (
                  <div key={dia.dia_semana} className={`flex items-center justify-between p-4 rounded-2xl transition-all ${dia.esta_abierto ? "bg-white/5 border border-[#00FF9F]/20" : "bg-black/20 opacity-40"}`}>
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={dia.esta_abierto}
                        className="data-[state=checked]:bg-[#00FF9F]"
                        onCheckedChange={(val) => actualizarDia(dia.dia_semana, "esta_abierto", val)}
                      />
                      <span className={`text-sm font-black uppercase tracking-widest ${dia.esta_abierto ? "text-white" : "text-slate-500"}`}>
                        {NOMBRES_DIAS[dia.dia_semana]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input type="time" className="bg-black/40 border-white/10 text-white w-28 h-9 text-center font-mono" value={dia.hora_apertura} disabled={!dia.esta_abierto} onChange={(e) => actualizarDia(dia.dia_semana, "hora_apertura", e.target.value)} />
                      <ArrowRight size={14} className="text-slate-600" />
                      <Input type="time" className="bg-black/40 border-white/10 text-white w-28 h-9 text-center font-mono" value={dia.hora_cierre} disabled={!dia.esta_abierto} onChange={(e) => actualizarDia(dia.dia_semana, "hora_cierre", e.target.value)} />
                    </div>
                  </div>
                ))}
                <div className="pt-6">
                  <Button onClick={guardarHorarios} disabled={guardando} className="w-full bg-[#00FF9F] text-black font-black h-12 rounded-xl hover:bg-[#00cc7e] transition-all">
                    {guardando ? <Loader2 className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                    SINCRONIZAR CALENDARIO
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        </motion.div>
      </AnimatePresence>
    </AdminPageLayout>
  );
}