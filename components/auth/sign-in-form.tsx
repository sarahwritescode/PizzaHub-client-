"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { GoogleButton } from "@/components/auth/google-button";
import { authClient } from "@/lib/auth-client";
import { postSignInPath, safeNextPath } from "@/lib/roles";
import { signInSchema, type SignInValues } from "@/lib/validation";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const blocked = searchParams.get("blocked") === "1";
  // Set by proxy.ts when a signed-out visitor opened a menu item.
  const next = searchParams.get("next");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (blocked) {
      // Drop the session cookie of a blocked user so they can't keep poking at routes.
      void authClient.signOut();
      toast.add({
        type: "error",
        title: "Account blocked",
        description: "Your account has been blocked. Please contact support.",
      });
    }
  }, [blocked]);

  async function onSubmit(values: SignInValues) {
    let result: Awaited<ReturnType<typeof authClient.signIn.email>>;
    try {
      result = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });
    } catch {
      // fetch() throws when the auth server can't be reached at all
      toast.add({
        type: "error",
        title: "Can't reach the server",
        description: "Check your connection and try again in a moment.",
      });
      return;
    }

    const { data, error } = result;
    if (error) {
      toast.add({
        type: "error",
        title: "Sign in failed",
        description: error.message || "Invalid email or password.",
      });
      return;
    }

    if (data.user.isBlocked) {
      await authClient.signOut();
      toast.add({
        type: "error",
        title: "Account blocked",
        description: "Your account has been blocked. Please contact support.",
      });
      return;
    }

    toast.add({ type: "success", title: "Signed in", description: "Welcome back!" });
    router.push(postSignInPath(next, data.user.role));
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <FieldError errors={[errors.password]} />
        </Field>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>

        <FieldSeparator>or</FieldSeparator>

        <GoogleButton
          label="Sign in with Google"
          returnTo={safeNextPath(next)}
        />

        <p className="text-center text-sm text-muted-foreground">
          New to PizzaHub?{" "}
          <Link href="/sign-up" className="font-medium text-foreground underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </FieldGroup>
    </form>
  );
}
