import AdminConfiguracionClient from "./AdminConfiguracionClient";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ConfiguracionPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  return <AdminConfiguracionClient slug={slug} />;
}
