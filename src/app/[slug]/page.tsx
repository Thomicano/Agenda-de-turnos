// app/[slug]/page.tsx
import ReservarTurno from "@/components/ReservarTurno";

export default function NegocioPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  return <ReservarTurno slug={params.slug} />;
}

// Opcional: Generar metadata dinámica
export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}) {
  // Aquí podrías consultar el nombre del negocio desde Supabase
  return {
    title: `Reservar turno - ${params.slug}`,
    description: "Reserva tu turno de manera fácil y rápida",
  };
}
