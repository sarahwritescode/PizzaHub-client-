"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { toast } from "@/components/ui/toast";
import { GoogleButton } from "@/components/auth/google-button";
import { authClient } from "@/lib/auth-client";
import { dashboardPathFor } from "@/lib/roles";
import { signUpSchema, type SignUpValues } from "@/lib/validation";

export function SignUpForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", image: "", role: "customer" },
  });

  async function onSubmit(values: SignUpValues) {
    const { error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      image: values.image || undefined,
      role: values.role,
    });

    if (error) {
      toast.add({
        type: "error",
        title: "Sign up failed",
        description: error.message || "Something went wrong. Please try again.",
      });
      return;
    }

    toast.add({
      type: "success",
      title: "Account created",
      description: "Welcome to PizzaHub!",
    });
    router.push(dashboardPathFor(values.role));
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">Full name</FieldLabel>
          <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>

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
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <FieldError errors={[errors.password]} />
        </Field>

        <Field data-invalid={!!errors.image}>
          <FieldLabel htmlFor="image">Profile image URL (optional)</FieldLabel>
          <Input
            id="image"
            type="url"
            placeholder="https://..."
            aria-invalid={!!errors.image}
            {...register("image")}
          />
          <FieldError errors={[errors.image]} />
        </Field>

        <Field data-invalid={!!errors.role}>
          <FieldLabel htmlFor="role">I am a</FieldLabel>
          <NativeSelect className="w-full" id="role" aria-invalid={!!errors.role} {...register("role")}>
            <NativeSelectOption value="customer">Customer</NativeSelectOption>
            <NativeSelectOption value="vendor">Vendor (Restaurant Owner)</NativeSelectOption>
          </NativeSelect>
          <FieldError errors={[errors.role]} />
        </Field>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>

        <FieldSeparator>or</FieldSeparator>

        <GoogleButton label="Sign up with Google" />

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-foreground underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </FieldGroup>
    </form>
  );
}
