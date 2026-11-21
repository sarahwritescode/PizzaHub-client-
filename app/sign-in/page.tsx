import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = { title: "Sign in | PizzaHub" };

export default function SignInPage() {
  return (
    <AuthCard title="Sign in" description="Welcome back. Sign in to your PizzaHub account.">
      {/* SignInForm reads search params, which must sit behind a Suspense boundary */}
      <Suspense>
        <SignInForm />
      </Suspense>
    </AuthCard>
  );
}
