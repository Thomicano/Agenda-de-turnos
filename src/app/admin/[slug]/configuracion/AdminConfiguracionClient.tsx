"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { AdminPageLayout } from "@/components/AdminPageLayout";

// 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
const NOMBRES_DIAS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

type DiaConfig = {
  dia_semana: number;
  esta_abierto: boolean;
  hora_apertura: string;
  hora_cierre: string;
};

export default function AdminConfiguracionClient({ slug }: { slug: string }) {
  const [negocioId, setNegocioId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Inicializamos un arreglo con los 7 días (estado inicial)
  const [horarios, setHorarios] = useState<DiaConfig[]>(
    Array.from({ length: 7 }, (_, index) => ({
      dia_semana: index,
      esta_abierto: false,
      hora_apertura: "09:00",
      hora_cierre: "18:00",
    }))
  );

  // 1. Obtener negocio_id
  useEffect(() => {
    const fetchNegocio = async () => {
      const { data } = await supabase
        .from("negocios")
        .select("id")
        .eq("slug", slug)
        .single();
      if (data) setNegocioId(data.id);
    };
    fetchNegocio();
  }, [slug]);

  // 2. Cargar horarios si ya existen
  useEffect(() => {
    if (!negocioId) return;

    const fetchHorarios = async () => {
      const { data, error } = await supabase
        .from("horarios_config")
        .select("*")
        .eq("negocio_id", negocioId);

      if (data && data.length > 0) {
        // Combinamos la respuesta en crudo con nuestro estado base
        setHorarios((prev) =>
          prev.map((diaBase) => {
            const existe = data.find((d) => d.dia_semana === diaBase.dia_semana);
            return existe
              ? {
                  dia_semana: existe.dia_semana,
                  esta_abierto: existe.esta_abierto,
                  hora_apertura: existe.hora_apertura,
                  hora_cierre: existe.hora_cierre,
                }
              : diaBase;
          })
        );
      }
      setLoading(false);
    };

    fetchHorarios();
  }, [negocioId]);

  // Guardar configuración
  const guardarConfiguracion = async () => {
    if (!negocioId) return;
    setGuardando(true);

    const payload = horarios.map((h) => ({
      negocio_id: negocioId,
      dia_semana: h.dia_semana,
      esta_abierto: h.esta_abierto,
      hora_apertura: h.hora_apertura,
      hora_cierre: h.hora_cierre,
    }));

    console.log("DATOS A GUARDAR:", payload);

    // Upsert requiere un conflicto clave. Normalmente negocio_id y dia_semana si definimos llave compuesta.
    // Asumiremos que Supabase lo auto-resuelva sobre los identificadores unicos configurados.
    const { error } = await supabase.from("horarios_config").upsert(payload, {
      onConflict: 'negocio_id,dia_semana'
    });

    setGuardando(false);

    if (error) {
      console.error("ERROR DE SUPABASE:", error);
      alert("Hubo un error al guardar los horarios. ¿Están configuradas las claves únicas en Supabase?");
    } else {
      alert("¡Horarios guardados con éxito!");
    }
  };

  const actualizarDia = (dia_semana: number, campo: keyof DiaConfig, valor: any) => {
    setHorarios((prev) =>
      prev.map((h) => (h.dia_semana === dia_semana ? { ...h, [campo]: valor } : h))
    );
  };

  if (loading) return <div className="p-6">Cargando configuración...</div>;

  return (
    <AdminPageLayout
      title="Configuración de Horarios"
      subtitle="Habilitá los días que tu negocio atiende y ajustá sus horas."
    >

      <Card>
        <CardContent className="p-6 space-y-4">
          {horarios.map((dia) => (
            <div
              key={dia.dia_semana}
              className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-3 rounded-lg border ${
                dia.esta_abierto ? "bg-white border-indigo-100" : "bg-gray-50 border-gray-100 text-gray-500"
              }`}
            >
              <div className="flex items-center gap-3 w-full md:w-1/3">
                <Switch
                  checked={dia.esta_abierto}
                  onCheckedChange={(val) =>
                    actualizarDia(dia.dia_semana, "esta_abierto", val)
                  }
                />
                <span className="font-medium whitespace-nowrap">
                  {NOMBRES_DIAS[dia.dia_semana]}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto md:flex-1 justify-between md:justify-end">
                <Input
                  type="time"
                  className="flex-1 md:w-[120px] md:flex-none"
                  value={dia.hora_apertura}
                  disabled={!dia.esta_abierto}
                  onChange={(e) =>
                    actualizarDia(dia.dia_semana, "hora_apertura", e.target.value)
                  }
                />
                <span className="text-sm font-medium flex-shrink-0">a</span>
                <Input
                  type="time"
                  className="flex-1 md:w-[120px] md:flex-none"
                  value={dia.hora_cierre}
                  disabled={!dia.esta_abierto}
                  onChange={(e) =>
                    actualizarDia(dia.dia_semana, "hora_cierre", e.target.value)
                  }
                />
              </div>
            </div>
          ))}

          <Button
            onClick={guardarConfiguracion}
            disabled={guardando}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700"
          >
            {guardando ? "Guardando..." : "Guardar Horarios"}
          </Button>
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
}
