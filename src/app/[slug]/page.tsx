// app/[slug]/page.tsx
import ReservarTurno from "@/components/ReservarTurno";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function NegocioPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  return <ReservarTurno slug={slug} />;
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  return {
    title: `Reservar turno - ${slug}`,
    description: "Reserva tu turno de manera fácil y rápida",
  };
}
