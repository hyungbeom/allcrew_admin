import CrewDetailPage from "@/components/crew-db/CrewDetailPage";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <CrewDetailPage crewId={id} />;
}
