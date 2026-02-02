"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Servicio = {
  nombre: string;
  precio: string;
  duracion: string;
};

export default function ReservarPage() {
  const [servicios, setServicios] = useState<Servicio[]>([
    { nombre: "", precio: "", duracion: "" },
  ]);

  // Agregar servicio
  const agregarServicio = () => {
    setServicios([
      ...servicios,
      { nombre: "", precio: "", duracion: "" },
    ]);
  };

  // Eliminar servicio
  const eliminarServicio = (index: number) => {
    setServicios(servicios.filter((_, i) => i !== index));
  };

  // Cambiar valores
  const actualizarServicio = (
    index: number,
    campo: keyof Servicio,
    valor: string
  ) => {
    const copia = [...servicios];
    copia[index][campo] = valor;
    setServicios(copia);
  };

  return (
    <div className="max-w-2xl mx-auto py-16 space-y-8">

      {/* TÍTULO */}
      <h1 className="text-3xl font-bold">
        Crear negocio
      </h1>

      {/* SERVICIOS */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Servicios ofrecidos
        </h2>

        {servicios.map((servicio, index) => (
          <Card key={index}>
            <CardContent className="p-4 space-y-3">

              <Input
                placeholder="Nombre del servicio"
                value={servicio.nombre}
                onChange={(e) =>
                  actualizarServicio(index, "nombre", e.target.value)
                }
              />

              <div className="flex gap-3">
                <Input
                  type="number"
                  placeholder="Precio ($)"
                  value={servicio.precio}
                  onChange={(e) =>
                    actualizarServicio(index, "precio", e.target.value)
                  }
                />

                <Input
                  type="number"
                  placeholder="Duración (min)"
                  value={servicio.duracion}
                  onChange={(e) =>
                    actualizarServicio(index, "duracion", e.target.value)
                  }
                />
              </div>

              {/* ELIMINAR */}
              {servicios.length > 1 && (
                <Button
                  variant="destructive"
                  onClick={() => eliminarServicio(index)}
                >
                  Eliminar servicio
                </Button>
              )}

            </CardContent>
          </Card>
        ))}
      </div>

      {/* AGREGAR */}
      <Button variant="outline" onClick={agregarServicio}>
        + Agregar otro servicio
      </Button>

      {/* GUARDAR */}
      <Button className="w-full">
        Guardar negocio
      </Button>

    </div>
  );
}
