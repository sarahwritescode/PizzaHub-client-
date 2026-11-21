import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { dashboardPathFor } from "@/lib/roles";

// /dashboard has no UI of its own: it sends each user to the dashboard for
// their role (also the landing route after Google sign-in).
async function DashboardRedirect(): Promise<null> {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  if (user.isBlocked) redirect("/sign-in?blocked=1");
  redirect(dashboardPathFor(user.role));
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted-foreground">Loading...</p>}>
      <DashboardRedirect />
    </Suspense>
  );
}
