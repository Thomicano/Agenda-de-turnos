"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

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

export default function CrearNegocioPage() {
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
  const [intervaloAutomatico, setIntervaloAutomatico] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [mostrarPreview, setMostrarPreview] = useState(false);

  // Calcular intervalo automático basado en duración
  const calcularIntervaloAutomatico = (duracion: string) => {
    const duracionNum = parseInt(duracion);
    if (!duracionNum) return "0";
    
    // Lógica: 10% del tiempo del turno, mínimo 5 minutos
    const intervaloCalculado = Math.max(5, Math.ceil(duracionNum * 0.1));
    return intervaloCalculado.toString();
  };

  // Actualizar intervalo cuando cambia la duración (si está en modo automático)
  const handleDuracionChange = (valor: string) => {
    setDuracionTurno(valor);
    if (intervaloAutomatico && valor) {
      setIntervaloTurno(calcularIntervaloAutomatico(valor));
    }
  };

  // Manejo de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Por favor sube una imagen válida (JPG, PNG o WEBP)');
      return;
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > maxSize) {
      alert('La imagen es muy grande. El tamaño máximo es 5MB');
      return;
    }

    setImagenFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagenPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen o logo
                </label>
                
                {!imagenPreview ? (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-10 h-10 mb-3 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-600">
                        <span className="font-semibold">Click para subir</span> o arrastrá la imagen
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG o WEBP (MAX. 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                ) : (
                  <div className="relative">
                    <img
                      src={imagenPreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition rounded-lg flex items-center justify-center group">
                      <div className="hidden group-hover:flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setImagenPreview("");
                            setImagenFile(null);
                          }}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition cursor-pointer"
                        >
                          🗑️ Eliminar
                        </button>
                        <label className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition cursor-pointer">
                          📷 Cambiar
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                    </div>
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

            <div className="mt-4 space-y-4">
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
                  onChange={(e) => handleDuracionChange(e.target.value)}
                />
                {errors.duracionTurno && (
                  <p className="text-red-500 text-sm mt-1">{errors.duracionTurno}</p>
                )}
              </div>

              {/* INTERVALO AUTOMÁTICO */}
              <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg">
                <input
                  type="checkbox"
                  id="intervalo-auto"
                  checked={intervaloAutomatico}
                  onChange={(e) => {
                    setIntervaloAutomatico(e.target.checked);
                    if (e.target.checked && duracionTurno) {
                      setIntervaloTurno(calcularIntervaloAutomatico(duracionTurno));
                    }
                  }}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="intervalo-auto" className="text-sm text-gray-700">
                  Calcular intervalo automáticamente (10% de la duración)
                </label>
              </div>

              {/* INTERVALO MANUAL */}
              {!intervaloAutomatico && (
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
                    Tiempo de descanso entre turnos
                  </p>
                </div>
              )}

              {/* MOSTRAR INTERVALO CALCULADO */}
              {intervaloAutomatico && duracionTurno && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  ℹ️ Intervalo calculado: <strong>{intervaloTurno} minutos</strong>
                  <br />
                  <span className="text-xs">
                    Ejemplo: Turno de {duracionTurno} min + {intervaloTurno} min de intervalo = {parseInt(duracionTurno) + parseInt(intervaloTurno || "0")} min total
                  </span>
                </div>
              )}
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
          {/* BOTONES FINALES */}
          {/* ========================= */}
          <div className="pt-6 space-y-3">
            {/* Botón Preview */}
            <button
              type="button"
              onClick={() => setMostrarPreview(true)}
              className="
                w-full
                bg-white
                border-2
                border-indigo-600
                text-indigo-600
                py-3
                rounded-lg
                text-lg
                hover:bg-indigo-50
                transition
                font-semibold
              "
            >
              👁️ Vista previa de mi agenda
            </button>

            {/* Botón Crear */}
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
                font-semibold
              "
            >
              {loading ? "Creando agenda..." : "✨ Crear mi agenda"}
            </button>
          </div>
        </form>

        {/* ========================= */}
        {/* MODAL DE PREVIEW */}
        {/* ========================= */}
        {mostrarPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header del Modal */}
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Vista previa de tu agenda
                </h2>
                <button
                  onClick={() => setMostrarPreview(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Contenido del Preview */}
              <div className="p-6">
                {/* Header del negocio */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-lg mb-6">
                  <div className="flex items-start gap-4">
                    {imagenPreview ? (
                      <img
                        src={imagenPreview}
                        alt={nombreNegocio}
                        className="w-20 h-20 rounded-lg object-cover border-2 border-white"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-white bg-opacity-20 flex items-center justify-center text-4xl">
                        🏪
                      </div>
                    )}
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold">
                        {nombreNegocio || "Nombre de tu negocio"}
                      </h1>
                      <p className="text-indigo-100 mt-1">{rubro}</p>
                      {direccion && (
                        <p className="text-sm text-indigo-100 mt-2">📍 {direccion}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Información de contacto */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="font-semibold text-gray-900">
                      {telefono || "No especificado"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">
                      {email || "No especificado"}
                    </p>
                  </div>
                </div>

                {/* Servicios */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    📋 Servicios disponibles
                  </h3>
                  {servicios.filter(s => s.nombre).length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      Aún no agregaste servicios
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {servicios
                        .filter(s => s.nombre)
                        .map((servicio, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-white border rounded-lg"
                          >
                            <div>
                              <p className="font-semibold text-gray-900">
                                {servicio.nombre}
                              </p>
                              <p className="text-sm text-gray-600">
                                {servicio.duracion} minutos
                              </p>
                            </div>
                            <p className="text-lg font-bold text-indigo-600">
                              ${servicio.precio}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Horarios */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    🕐 Horarios de atención
                  </h3>
                  {horarios.filter(h => h.dia && h.desde && h.hasta).length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      Aún no configuraste horarios
                    </p>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-2">
                      {horarios
                        .filter(h => h.dia && h.desde && h.hasta)
                        .map((horario, index) => (
                          <div
                            key={index}
                            className="flex justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <span className="font-medium text-gray-900">
                              {horario.dia}
                            </span>
                            <span className="text-gray-600">
                              {horario.desde} - {horario.hasta}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Configuración de turnos */}
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    ⚙️ Configuración
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duración por turno:</span>
                      <span className="font-semibold text-gray-900">
                        {duracionTurno || "0"} minutos
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Intervalo entre turnos:</span>
                      <span className="font-semibold text-gray-900">
                        {intervaloTurno || "0"} minutos {intervaloAutomatico && "(automático)"}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="text-gray-600">Tiempo total por slot:</span>
                      <span className="font-semibold text-indigo-600">
                        {(parseInt(duracionTurno || "0") + parseInt(intervaloTurno || "0"))} minutos
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ejemplo de horarios disponibles */}
                {duracionTurno && horarios.some(h => h.dia && h.desde && h.hasta) && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      📅 Ejemplo de horarios generados
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Así verán los clientes los horarios disponibles para reservar:
                    </p>
                    {(() => {
                      const primerHorario = horarios.find(h => h.dia && h.desde && h.hasta);
                      if (!primerHorario) return null;

                      const [horaInicio, minInicio] = primerHorario.desde.split(":").map(Number);
                      const slots = [];
                      let horaActual = horaInicio * 60 + minInicio;
                      const duracion = parseInt(duracionTurno);
                      const intervalo = parseInt(intervaloTurno || "0");
                      
                      // Generar los primeros 6 slots como ejemplo
                      for (let i = 0; i < 6; i++) {
                        const horas = Math.floor(horaActual / 60);
                        const minutos = horaActual % 60;
                        slots.push(`${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`);
                        horaActual += duracion + intervalo;
                      }

                      return (
                        <div className="grid grid-cols-3 gap-2">
                          {slots.map((slot, index) => (
                            <div
                              key={index}
                              className="p-2 bg-white border-2 border-indigo-200 rounded text-center text-sm font-medium text-gray-900"
                            >
                              {slot}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Footer del Modal */}
              <div className="sticky bottom-0 bg-gray-50 border-t p-4">
                <button
                  onClick={() => setMostrarPreview(false)}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
                >
                  Cerrar vista previa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}