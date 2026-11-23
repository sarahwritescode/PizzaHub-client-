import type { Metadata } from "next";
import { ProfileSettings } from "@/components/shared/profile-settings";

export const metadata: Metadata = { title: "Profile settings | PizzaHub vendor" };

export default function Page() {
  return <ProfileSettings role="vendor" />;
}
