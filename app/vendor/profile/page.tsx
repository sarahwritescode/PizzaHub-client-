import type { Metadata } from "next";
import { ProfileView } from "@/components/vendor/profile-view";

export const metadata: Metadata = { title: "Profile | PizzaHub vendor" };

export default function Page() {
  return <ProfileView />;
}
