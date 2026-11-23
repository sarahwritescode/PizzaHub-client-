"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { PageHeader } from "@/components/shared/page-header";
import { useSubscription } from "@/hooks/use-subscription";
import { authClient } from "@/lib/auth-client";
import { profileSchema, type ProfileValues } from "@/lib/validation";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return ((parts[0][0] ?? "") + (parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "")).toUpperCase();
}

/**
 * Profile Settings for customers and vendors. Editable: name, profile image
 * (a link, optional) and, for vendors, the business name. Email, role and plan
 * are shown but cannot be changed here, and the request never carries a role or
 * a subscription field (the backend refuses those too).
 */
export function ProfileSettings({ role }: { role: "customer" | "vendor" }) {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  return (
    <>
      <PageHeader title="Profile settings" description="Update how your account appears on PizzaHub." />
      {isPending && <Skeleton className="h-96 max-w-xl rounded-2xl" />}
      {!isPending && !user && (
        <p className="text-sm text-ink/65">We could not load your account. Please sign in again.</p>
      )}
      {user && (
        // key: a new session user (after a save) resets the form to the saved values.
        <ProfileForm
          key={`${user.id}:${user.name}:${user.image ?? ""}:${user.businessName ?? ""}`}
          role={role}
          user={{ name: user.name, email: user.email, image: user.image ?? "", businessName: user.businessName ?? "" }}
        />
      )}
    </>
  );
}

function ProfileForm({
  role,
  user,
}: {
  role: "customer" | "vendor";
  user: { name: string; email: string; image: string; businessName: string };
}) {
  const isVendor = role === "vendor";
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, image: user.image, businessName: user.businessName },
  });

  const previewName = useWatch({ control, name: "name" }) || user.name;
  const typedImage = useWatch({ control, name: "image" });
  // Preview only real http(s) links (never anything else the user may have typed).
  const previewImage = typedImage && /^https?:\/\//i.test(typedImage) ? typedImage : undefined;

  async function onSubmit(values: ProfileValues) {
    let result: Awaited<ReturnType<typeof authClient.updateUser>>;
    try {
      result = await authClient.updateUser({
        name: values.name,
        image: values.image ? values.image : null,
        // Only vendors have a business name. Never send role, email or plan fields.
        ...(isVendor ? { businessName: values.businessName ?? "" } : {}),
      });
    } catch {
      toast.add({
        type: "error",
        title: "Can't reach the server",
        description: "Check your connection and try again in a moment.",
      });
      return;
    }

    if (result.error) {
      toast.add({
        type: "error",
        title: "Could not update your profile",
        description: result.error.message || "Something went wrong. Please try again.",
      });
      return;
    }
    toast.add({ type: "success", title: "Profile updated", description: "Your changes have been saved." });
    // The dashboard sidebar is rendered on the server; refresh it with the new name.
    router.refresh();
  }


  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="max-w-xl rounded-2xl border border-crust bg-white p-5 sm:p-6"
      aria-label="Profile settings"
    >
      <div className="mb-6 flex items-center gap-4">
        <Avatar className="size-16">
          {previewImage ? <AvatarImage src={previewImage} alt="" /> : null}
          <AvatarFallback className="bg-crust text-lg font-semibold text-ink">{initials(previewName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-bold text-ink">{previewName}</p>
          <p className="truncate text-sm text-ink/60">{user.email}</p>
        </div>
      </div>

      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="profile-name">Full name</FieldLabel>
          <Input id="profile-name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>

        {isVendor && (
          <Field data-invalid={!!errors.businessName}>
            <FieldLabel htmlFor="profile-business">Business name (optional)</FieldLabel>
            <Input
              id="profile-business"
              placeholder="Your pizzeria"
              aria-invalid={!!errors.businessName}
              {...register("businessName")}
            />
            <FieldError errors={[errors.businessName]} />
          </Field>
        )}

        <Field data-invalid={!!errors.image}>
          <FieldLabel htmlFor="profile-image">Profile image link (optional)</FieldLabel>
          <Input
            id="profile-image"
            type="url"
            placeholder="https://..."
            aria-invalid={!!errors.image}
            {...register("image")}
          />
          <FieldDescription>Paste a link to a picture. Leave it empty to use your initials.</FieldDescription>
          <FieldError errors={[errors.image]} />
        </Field>
      </FieldGroup>

      <dl className="mt-6 divide-y divide-crust border-t border-crust">
        <Row label="Email" value={user.email} />
        <Row label="Role" value={isVendor ? "Vendor" : "Customer"} />
        {isVendor && <VendorPlanRow />}
      </dl>
      <p className="text-xs text-ink/55">Your email, role and plan cannot be changed here.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={!isDirty || isSubmitting}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!isDirty || isSubmitting}
          onClick={() => reset({ name: user.name, image: user.image, businessName: user.businessName })}
        >
          Discard
        </Button>
      </div>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 py-3 text-sm">
      <dt className="font-medium text-ink/60">{label}</dt>
      <dd className="font-semibold break-all text-ink">{value}</dd>
    </div>
  );
}

// Vendors only: the subscription endpoint is vendor-only on the backend.
function VendorPlanRow() {
  const { plan } = useSubscription();
  return <Row label="Plan" value={plan ? (plan.isPremium ? "Premium" : "Free") : "Loading..."} />;
}
