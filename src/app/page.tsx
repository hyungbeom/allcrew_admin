import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getDashboardRedirectPath } from "@/lib/companyPaths";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("allcrew_token")?.value;
  const companySlug = cookieStore.get("allcrew_company_slug")?.value;

  if (token) {
    redirect(getDashboardRedirectPath(companySlug));
  }

  redirect("/login");
}
