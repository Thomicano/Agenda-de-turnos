import AdminServiciosClient from "./AdminServiciosClient";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  return <AdminServiciosClient slug={slug} />;
}
