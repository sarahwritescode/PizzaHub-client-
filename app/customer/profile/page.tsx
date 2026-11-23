import type { Metadata } from "next";
import { ProfileSettings } from "@/components/shared/profile-settings";

export const metadata: Metadata = { title: "Profile settings | PizzaHub" };

export default function Page() {
  return <ProfileSettings role="customer" />;
}
