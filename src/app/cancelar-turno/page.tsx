"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { XCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function CancelarTurnoContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [detalles, setDetalles] = useState<{ negocio: string; fecha: string } | null>(null);

    useEffect(() => {
        if (token) {
            procesarCancelacion();
        } else {
            setStatus("error");
        }
    }, [token]);

    const procesarCancelacion = async () => {
        try {
            // 1. Buscamos el turno y el nombre del negocio (Join)
            const { data: turno, error: searchError } = await supabase
                .from("turnos")
                .select(`
          fecha, 
          hora, 
          negocios ( nombre )
        `)
                .eq("cancel_token", token)
                .single();

            if (searchError || !turno) throw new Error("Turno no encontrado");

            // 2. Actualizamos el estado a 'cancelado'
            const { error: updateError } = await supabase
                .from("turnos")
                .update({ estado: "cancelado" })
                .eq("cancel_token", token);

            if (updateError) throw updateError;

            // @ts-ignore - para manejar el tipado del join de supabase
            setDetalles({ negocio: turno.negocios.nombre, fecha: `${turno.fecha} ${turno.hora}` });
            setStatus("success");
        } catch (err) {
            console.error(err);
            setStatus("error");
        }
    };

    return (
        <main className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 font-sans">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,255,159,0.05)_0%,transparent_70%)]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl text-center"
            >
                {status === "loading" && (
                    <div className="py-10">
                        <Loader2 className="w-12 h-12 text-[#00FF9F] animate-spin mx-auto mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Procesando cancelación...</p>
                    </div>
                )}

                {status === "success" && (
                    <>
                        <div className="w-20 h-20 bg-[#00FF9F]/10 text-[#00FF9F] rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={40} />
                        </div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Turno Cancelado</h1>
                        <p className="text-slate-400 text-sm mb-6">
                            Tu cita en <span className="text-white font-bold">{detalles?.negocio}</span> para el <span className="text-white font-bold">{detalles?.fecha}</span> ha sido liberada.
                        </p>
                        <Button
                            onClick={() => window.close()}
                            className="w-full h-14 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black uppercase tracking-widest text-xs"
                        >
                            Cerrar Ventana
                        </Button>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <XCircle size={40} />
                        </div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Ups! Algo falló</h1>
                        <p className="text-slate-400 text-sm mb-8">
                            El link no es válido o el turno ya fue cancelado anteriormente.
                        </p>
                        <Button
                            onClick={() => router.push('/')}
                            className="w-full h-14 bg-[#00FF9F] text-black rounded-2xl font-black uppercase tracking-widest text-xs"
                        >
                            Ir al Inicio
                        </Button>
                    </>
                )}
            </motion.div>
        </main>
    );
}
// 3. El export principal solo envuelve al componente en Suspense
export default function CancelarTurnoPage() {
    return (
        <main className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 font-sans">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,255,159,0.05)_0%,transparent_70%)]" />
            <Suspense fallback={<Loader2 className="animate-spin text-[#00FF9F]" />}>
                <CancelarTurnoContent />
            </Suspense>
        </main>
    );
}