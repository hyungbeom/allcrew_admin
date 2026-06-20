import DashboardLayout from "@/components/layout/DashboardLayout";
import { CompanySlugProvider } from "@/components/layout/CompanySlugProvider";

type AdminLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ companySlug: string }>;
};

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { companySlug } = await params;

  return (
    <CompanySlugProvider companySlug={companySlug}>
      <DashboardLayout>{children}</DashboardLayout>
    </CompanySlugProvider>
  );
}
