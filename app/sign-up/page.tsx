import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = { title: "Sign up | PizzaHub" };

export default function SignUpPage() {
  return (
    <AuthCard title="Create your account" description="Join PizzaHub as a customer or a vendor.">
      <SignUpForm />
    </AuthCard>
  );
}
