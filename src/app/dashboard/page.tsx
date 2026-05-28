import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardRedirectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any)?.role?.toLowerCase() || "student";
  redirect(`/${role}/dashboard`);
}
