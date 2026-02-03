"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// 1️⃣ imports
import { useState } from "react";

// 2️⃣ types (ACÁ va lo que preguntaste)
type DiaHorario = {
  dia: string;
  desde: string;
  hasta: string;
};

export default function CrearNegocio() {
  const [horarios, setHorarios] = useState<DiaHorario[]>([
    { dia: "Lunes", desde: "", hasta: "" },
    ]);
    const agregarDia = () => {
  setHorarios([...horarios, { dia: "", desde: "", hasta: "" }]);
};

const eliminarDia = (index: number) => {
  setHorarios(horarios.filter((_, i) => i !== index));
};

const actualizarHorario = (
  index: number,
  campo: keyof DiaHorario,
  valor: string
) => {
  const copia = [...horarios];
  copia[index][campo] = valor;
  setHorarios(copia);
};
  return (
    <main
      className="
        min-h-screen
        bg-gray-50     /* COLOR FONDO GENERAL */
        py-16
      "
    >
      <div
        className="
          max-w-3xl
          mx-auto
          bg-white     /* COLOR TARJETA */
          p-8
          rounded-xl
          shadow
        "
      >
        {/* TÍTULO */}
        <h1
          className="
            text-3xl font-bold text-gray-900  /* COLOR TÍTULO */">
          Configurá tu negocio
        </h1>

        <p
          className="
            mt-2
            text-gray-600 /* COLOR TEXTO SECUNDARIO */
          "
        >
          Completá los datos básicos para que tus clientes puedan reservar turnos.
        </p>

        {/* FORMULARIO */}
        <form className="mt-8 space-y-8">
          {/* ========================= */}
          {/* DATOS DEL NEGOCIO */}
          {/* ========================= */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800">
              Datos del negocio
            </h2>

            <div className="mt-4 space-y-4">
              {/* NOMBRE */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre del negocio
                </label>
                <input
                  type="text"
                  placeholder="Ej: Peluquería Juan"
                  className="
                    input-base
                  "
                />
              </div>

              {/* RUBRO */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rubro
                </label>
                <select
                  className="
                   input-base
                  "
                >
                  <option>Peluquería</option>
                  <option>Barbería</option>
                  <option>Estética</option>
                  <option>Consultorio</option>
                  <option>Otro</option>
                </select>
              </div>

              {/* IMAGEN */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Imagen o logo
                </label>
                <input
                  type="file"
                  className="mt-1 w-full text-sm text-gray-600"
                />
              </div>
            </div>
          </section>

          {/* ========================= */}
          {/* SERVICIOS */}
          {/* ========================= */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800">
              Servicios
            </h2>

            <p className="text-sm text-gray-600 mt-1">
              Cada servicio puede tener su propio precio y duración
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* SERVICIO */}
              <input
                type="text"
                placeholder="Servicio (ej: Corte)"
                className="input-base"
                
              />{/* PRECIO */}
              <input
                type="number"
                placeholder="Precio"
                className="input-base"
              />

              {/* DURACIÓN */}
              <input
                type="number"
                placeholder="Duración (min)"
                className="input-base"
              />
            </div>

            {/* BOTÓN AGREGAR SERVICIO (futuro) */}
            <button
              type="button"
              className="
                mt-4
                text-indigo-600 /* COLOR LINK */
                text-sm
                hover:underline
              "
            >
              + Agregar otro servicio
            </button>
          </section>

          {/* ========================= */}
          {/* CONFIGURACIÓN TURNOS */}
          {/* ========================= */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800">
              Configuración de turnos
            </h2>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* DURACIÓN TURNO */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Duración por turno (min)
                </label>
                <input
                  type="number"
                  placeholder="30"
                  className="input-base"
                />
              </div>

              {/* INTERVALO */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Intervalo entre turnos (min)
                </label>
                <input
                  type="number"
                  placeholder="5"
                  className="mt-1 w-full input-base"
                />
              </div>
            </div>
          </section>

          {/* ========================= */}
          {/* HORARIOS */}
          {/* ========================= */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800">
              Horarios de atención
            </h2>
            <div className="mt-4 space-y-4">
              {horarios.map((h, index) => (
                <Card key={index}>
                  <CardContent className="p-4 space-y-3">
                    <Input 
                      
                      placeholder="Día (ej: Lunes)"
                      value={h.dia}
                      className="input-base"
                      onChange={(e) =>
                        actualizarHorario(index, "dia", e.target.value)
                      }
                    />
                    <div className="flex gap-3">
                      <Input
                        type="time"
                        value={h.desde}
                        className="input-base"
                        onChange={(e) =>
                          actualizarHorario(index, "desde", e.target.value)
                        }
                      />
                      <Input
                        type="time"
                        value={h.hasta}
                        className="input-base"  
                        onChange={(e) =>
                          actualizarHorario(index, "hasta", e.target.value)
                        }
                      />
                    </div>
                    {horarios.length > 1 && (
                      <Button
                        variant="destructive"
                        onClick={() => eliminarDia(index)}
                      >
                        Eliminar día
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={agregarDia}>
                + Agregar día
              </Button>
            </div>
          </section>

          {/* ========================= */}
          {/* BOTÓN FINAL */}
          {/* ========================= */}
          <div className="pt-6">
            <button
              type="submit"
              className="
                w-full
                bg-indigo-600   /* COLOR BOTÓN PRINCIPAL */
                text-white
                py-3
                rounded-lg
                text-lg
                hover:bg-indigo-700
                transition
              "
            >
              Crear agenda
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
