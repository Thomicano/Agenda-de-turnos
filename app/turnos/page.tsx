"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Image from "next/image";

// Types
type DiaHorario = {
  dia: string;
  desde: string;
  hasta: string;
};

type Servicio = {
  nombre: string;
  precio: string;
  duracion: string;
};

const DIAS_SEMANA = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export default function CrearNegocio() {
  // States
  const [nombreNegocio, setNombreNegocio] = useState("");
  const [rubro, setRubro] = useState("Peluquería");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [email, setEmail] = useState("");
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string>("");
  
  const [servicios, setServicios] = useState<Servicio[]>([
    { nombre: "", precio: "", duracion: "" },
  ]);
  
  const [horarios, setHorarios] = useState<DiaHorario[]>([
    { dia: "Lunes", desde: "", hasta: "" },
  ]);
  
  const [duracionTurno, setDuracionTurno] = useState("");
  const [intervaloTurno, setIntervaloTurno] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Manejo de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagenFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Funciones para servicios
  const agregarServicio = () => {
    setServicios([...servicios, { nombre: "", precio: "", duracion: "" }]);
  };

  const eliminarServicio = (index: number) => {
    setServicios(servicios.filter((_, i) => i !== index));
  };

  const actualizarServicio = (
    index: number,
    campo: keyof Servicio,
    valor: string
  ) => {
    const copia = [...servicios];
    copia[index][campo] = valor;
    setServicios(copia);
  };

  // Funciones para horarios
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

  // Validación
  const validarFormulario = () => {
    const newErrors: {[key: string]: string} = {};

    if (!nombreNegocio.trim()) {
      newErrors.nombreNegocio = "El nombre del negocio es obligatorio";
    }

    if (!telefono.trim()) {
      newErrors.telefono = "El teléfono es obligatorio";
    }

    if (!email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "El email no es válido";
    }

    // Validar que haya al menos un servicio completo
    const serviciosValidos = servicios.filter(
      s => s.nombre.trim() && s.precio && s.duracion
    );
    if (serviciosValidos.length === 0) {
      newErrors.servicios = "Debes agregar al menos un servicio completo";
    }

    // Validar que haya al menos un horario completo
    const horariosValidos = horarios.filter(
      h => h.dia && h.desde && h.hasta
    );
    if (horariosValidos.length === 0) {
      newErrors.horarios = "Debes agregar al menos un horario de atención";
    }

    if (!duracionTurno) {
      newErrors.duracionTurno = "La duración del turno es obligatoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      // Filtrar solo servicios y horarios completos
      const serviciosCompletos = servicios.filter(
        s => s.nombre.trim() && s.precio && s.duracion
      );
      const horariosCompletos = horarios.filter(
        h => h.dia && h.desde && h.hasta
      );

      // Generar slug único para el link
      const slug = nombreNegocio
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const uniqueSlug = `${slug}-${Date.now()}`;

      const datosNegocio = {
        nombre: nombreNegocio,
        rubro,
        telefono,
        direccion,
        email,
        slug: uniqueSlug,
        servicios: serviciosCompletos,
        horarios: horariosCompletos,
        duracionTurno: parseInt(duracionTurno),
        intervaloTurno: intervaloTurno ? parseInt(intervaloTurno) : 0,
        // imagenFile se subiría a Supabase Storage
      };

      console.log("Datos a guardar:", datosNegocio);

      // AQUÍ irá la integración con Supabase
      // const { data, error } = await supabase.from('negocios').insert([datosNegocio])

      // Por ahora simulamos éxito
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert(`¡Negocio creado con éxito!\n\nTu link único es:\nhttps://tuapp.com/${uniqueSlug}`);
      
      // Aquí podrías redirigir al dashboard o mostrar el link
      
    } catch (error) {
      console.error("Error al crear negocio:", error);
      alert("Hubo un error al crear el negocio. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow">
        {/* TÍTULO */}
        <h1 className="text-3xl font-bold text-gray-900">
          Configurá tu negocio
        </h1>

        <p className="mt-2 text-gray-600">
          Completá los datos básicos para que tus clientes puedan reservar turnos.
        </p>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
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
                  Nombre del negocio *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Peluquería Juan"
                  className="input-base"
                  value={nombreNegocio}
                  onChange={(e) => setNombreNegocio(e.target.value)}
                />
                {errors.nombreNegocio && (
                  <p className="text-red-500 text-sm mt-1">{errors.nombreNegocio}</p>
                )}
              </div>

              {/* RUBRO */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rubro
                </label>
                <select
                  className="input-base"
                  value={rubro}
                  onChange={(e) => setRubro(e.target.value)}
                >
                  <option>Peluquería</option>
                  <option>Barbería</option>
                  <option>Estética</option>
                  <option>Consultorio</option>
                  <option>Gimnasio</option>
                  <option>Veterinaria</option>
                  <option>Otro</option>
                </select>
              </div>

              {/* TELÉFONO */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  placeholder="Ej: +54 9 11 1234-5678"
                  className="input-base"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
                {errors.telefono && (
                  <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>
                )}
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  placeholder="Ej: contacto@negocio.com"
                  className="input-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* DIRECCIÓN */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dirección
                </label>
                <input
                  type="text"
                  placeholder="Ej: Av. Corrientes 1234, CABA"
                  className="input-base"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                />
              </div>

              {/* IMAGEN */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Imagen o logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-1 w-full text-sm text-gray-600"
                  onChange={handleImageChange}
                />
                {imagenPreview && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                    <img
                      src={imagenPreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ========================= */}
          {/* SERVICIOS */}
          {/* ========================= */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800">
              Servicios *
            </h2>

            <p className="text-sm text-gray-600 mt-1">
              Cada servicio puede tener su propio precio y duración
            </p>

            <div className="mt-4 space-y-4">
              {servicios.map((servicio, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* SERVICIO */}
                      <input
                        type="text"
                        placeholder="Servicio (ej: Corte)"
                        className="input-base"
                        value={servicio.nombre}
                        onChange={(e) =>
                          actualizarServicio(index, "nombre", e.target.value)
                        }
                      />

                      {/* PRECIO */}
                      <input
                        type="number"
                        placeholder="Precio"
                        className="input-base"
                        value={servicio.precio}
                        onChange={(e) =>
                          actualizarServicio(index, "precio", e.target.value)
                        }
                      />

                      {/* DURACIÓN */}
                      <input
                        type="number"
                        placeholder="Duración (min)"
                        className="input-base"
                        value={servicio.duracion}
                        onChange={(e) =>
                          actualizarServicio(index, "duracion", e.target.value)
                        }
                      />
                    </div>

                    {servicios.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        className="mt-3"
                        onClick={() => eliminarServicio(index)}
                      >
                        Eliminar servicio
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {errors.servicios && (
              <p className="text-red-500 text-sm mt-2">{errors.servicios}</p>
            )}

            {/* BOTÓN AGREGAR SERVICIO */}
            <button
              type="button"
              className="mt-4 text-indigo-600 text-sm hover:underline"
              onClick={agregarServicio}
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
                  Duración por turno (min) *
                </label>
                <input
                  type="number"
                  placeholder="30"
                  className="input-base"
                  value={duracionTurno}
                  onChange={(e) => setDuracionTurno(e.target.value)}
                />
                {errors.duracionTurno && (
                  <p className="text-red-500 text-sm mt-1">{errors.duracionTurno}</p>
                )}
              </div>

              {/* INTERVALO */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Intervalo entre turnos (min)
                </label>
                <input
                  type="number"
                  placeholder="5"
                  className="input-base"
                  value={intervaloTurno}
                  onChange={(e) => setIntervaloTurno(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tiempo de descanso entre turnos (opcional)
                </p>
              </div>
            </div>
          </section>

          {/* ========================= */}
          {/* HORARIOS */}
          {/* ========================= */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800">
              Horarios de atención *
            </h2>
            <div className="mt-4 space-y-4">
              {horarios.map((h, index) => (
                <Card key={index}>
                  <CardContent className="p-4 space-y-3">
                    <select
                      className="input-base"
                      value={h.dia}
                      onChange={(e) =>
                        actualizarHorario(index, "dia", e.target.value)
                      }
                    >
                      <option value="">Seleccionar día</option>
                      {DIAS_SEMANA.map((dia) => (
                        <option key={dia} value={dia}>
                          {dia}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-1">
                          Desde
                        </label>
                        <Input
                          type="time"
                          value={h.desde}
                          className="input-base"
                          onChange={(e) =>
                            actualizarHorario(index, "desde", e.target.value)
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-1">
                          Hasta
                        </label>
                        <Input
                          type="time"
                          value={h.hasta}
                          className="input-base"
                          onChange={(e) =>
                            actualizarHorario(index, "hasta", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    {horarios.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => eliminarDia(index)}
                      >
                        Eliminar día
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
              <Button type="button" variant="outline" onClick={agregarDia}>
                + Agregar día
              </Button>
            </div>
            {errors.horarios && (
              <p className="text-red-500 text-sm mt-2">{errors.horarios}</p>
            )}
          </section>

          {/* ========================= */}
          {/* BOTÓN FINAL */}
          {/* ========================= */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                bg-indigo-600
                text-white
                py-3
                rounded-lg
                text-lg
                hover:bg-indigo-700
                transition
                disabled:bg-gray-400
                disabled:cursor-not-allowed
              "
            >
              {loading ? "Creando agenda..." : "Crear agenda"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}