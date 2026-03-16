import AdminDashboardClient from "./AdminDashboardClient";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function AdminDashboardPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  return <AdminDashboardClient slug={slug} />;
}
