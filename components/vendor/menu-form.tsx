"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeftIcon, InfoIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { ImageUploader, useImageUploads } from "@/components/vendor/image-uploader";
import { LimitWarning } from "@/components/vendor/menu-manager";
import {
  ErrorState,
  PageHeader,
  brandButtonClass,
  outlineButtonClass,
} from "@/components/vendor/shared";
import { useApiResource } from "@/hooks/use-api-resource";
import { usePlanUsage } from "@/hooks/use-plan-usage";
import { MENU_CATEGORIES } from "@/lib/categories";
import {
  LIMITS,
  createMenuItem,
  findMenuItem,
  updateMenuItem,
  type ApiFailure,
  type MenuItemInput,
  type VendorMenuItem,
} from "@/lib/vendor-api";

const required = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} must be at most ${max} characters.`);

// Same limits as the backend (VENDOR_MENU_TESTING.md). The backend validates
// again, so this is only for fast feedback.
const menuItemSchema = z.object({
  itemName: required("Item name", LIMITS.itemName),
  category: z.string().trim().min(1, "Choose a category.").max(LIMITS.category, `Category must be at most ${LIMITS.category} characters.`),
  description: required("Description", LIMITS.description),
  location: required("Location", LIMITS.location),
  price: z
    .string()
    .trim()
    .min(1, "Price is required.")
    .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, "Price must be a positive number.")
    .refine((value) => Number(value) <= LIMITS.maxPrice, `Price must be at most ${LIMITS.maxPrice.toLocaleString("en")}.`),
});
type FormValues = z.infer<typeof menuItemSchema>;

const FIELD_NAMES = ["itemName", "category", "description", "location", "price"] as const;

function BackLink() {
  return (
    <Link
      href="/vendor/menu"
      className="mb-4 inline-flex items-center gap-1 rounded-sm text-sm font-medium text-ink/65 outline-none transition-colors hover:text-tomato focus-visible:ring-2 focus-visible:ring-tomato"
    >
      <ChevronLeftIcon aria-hidden="true" className="size-4" /> Back to menu
    </Link>
  );
}

/** /vendor/menu/add */
export function AddMenuItemPage() {
  return (
    <>
      <BackLink />
      <PageHeader title="Add menu item" description="New items are reviewed by an admin before customers can see them." />
      <MenuItemForm />
    </>
  );
}

/** /vendor/menu/edit/[id] */
export function EditMenuItemPage({ id }: { id: string }) {
  const { result, loading, reload } = useApiResource(`item:${id}`, () => findMenuItem(id));

  return (
    <>
      <BackLink />
      <PageHeader title="Edit menu item" />
      {loading && !result && <p className="text-sm text-ink/65">Loading item...</p>}
      {result && !result.ok && <ErrorState message={result.message} onRetry={reload} />}
      {result?.ok && !result.data && (
        <ErrorState message="This menu item was not found. It may have been deleted, or it is not yours." />
      )}
      {result?.ok && result.data && <MenuItemForm item={result.data} />}
    </>
  );
}

function statusNote(item: VendorMenuItem) {
  switch (item.status) {
    case "approved":
      return "This item is live. Saving changes sends it back to pending approval, and it disappears from the public menu until an admin approves it again.";
    case "inactive":
      return "This item is inactive. Saving changes resubmits it as pending approval, and it needs a free slot on the Free plan.";
    case "rejected":
      return "This item was rejected. Saving changes resubmits it as pending approval, and it needs a free slot on the Free plan.";
    default:
      return null;
  }
}

function MenuItemForm({ item }: { item?: VendorMenuItem }) {
  const router = useRouter();
  const usage = usePlanUsage();
  // An item saved before the fixed category list may carry another category: keep it selectable.
  const categoryOptions: string[] =
    item?.category && !(MENU_CATEGORIES as readonly string[]).includes(item.category)
      ? [...MENU_CATEGORIES, item.category]
      : [...MENU_CATEGORIES];
  const uploads = useImageUploads(item?.images ?? []);
  const [imagesError, setImagesError] = useState<string>();
  const [formError, setFormError] = useState<string>();

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      itemName: item?.itemName ?? "",
      category: item?.category ?? "",
      description: item?.description ?? "",
      location: item?.location ?? "",
      price: item ? String(item.price) : "",
    },
  });

  const description = useWatch({ control, name: "description" }) ?? "";
  const note = item ? statusNote(item) : null;
  // Creating, or resubmitting an inactive / rejected item, takes a free slot.
  const needsSlot = !item || item.status === "inactive" || item.status === "rejected";
  const blockedByLimit = needsSlot && usage.atLimit;

  function showFailure(failure: ApiFailure) {
    if (failure.code === "FREE_PLAN_LIMIT_REACHED") usage.markLimitReached();
    let handled = false;
    for (const entry of failure.errors ?? []) {
      const name = FIELD_NAMES.find((field) => field === entry.field);
      if (name) {
        setError(name, { message: entry.message });
        handled = true;
      } else if (entry.field.startsWith("images")) {
        setImagesError(entry.message);
        handled = true;
      }
    }
    if (!handled) setFormError(failure.message);
    toast.add({ type: "error", title: item ? "Could not save changes" : "Could not add item", description: failure.message });
  }

  async function onSubmit(values: FormValues) {
    setFormError(undefined);
    setImagesError(undefined);

    if (uploads.uploading) {
      setImagesError("Wait for the images to finish uploading.");
      return;
    }
    if (uploads.failed) {
      setImagesError("Retry or remove the images that failed to upload.");
      return;
    }
    if (uploads.urls.length === 0) {
      setImagesError("Add at least one image.");
      return;
    }

    const input: MenuItemInput = {
      itemName: values.itemName,
      category: values.category,
      description: values.description,
      location: values.location,
      price: Number(values.price),
      images: uploads.urls,
    };

    if (!item) {
      const response = await createMenuItem(input);
      if (!response.ok) return showFailure(response);
      toast.add({ type: "success", title: "Menu item added", description: response.message });
      router.push("/vendor/menu");
      return;
    }

    // Only send what changed; sending nothing new is not an edit.
    const changes: Partial<MenuItemInput> = {};
    if (input.itemName !== item.itemName) changes.itemName = input.itemName;
    if (input.category !== item.category) changes.category = input.category;
    if (input.description !== item.description) changes.description = input.description;
    if (input.location !== item.location) changes.location = input.location;
    if (input.price !== item.price) changes.price = input.price;
    if (input.images.join("\n") !== item.images.join("\n")) changes.images = input.images;
    if (Object.keys(changes).length === 0) {
      toast.add({ type: "info", title: "No changes to save" });
      return;
    }

    const response = await updateMenuItem(item._id, changes);
    if (!response.ok) return showFailure(response);
    toast.add({ type: "success", title: "Menu item updated", description: response.message });
    router.push("/vendor/menu");
  }

  const submitDisabled = isSubmitting || uploads.uploading || blockedByLimit;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-3xl space-y-6">
      {blockedByLimit && <LimitWarning active={usage.active} />}
      {note && (
        <div role="note" className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <InfoIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>{note}</p>
        </div>
      )}
      {formError && (
        <p role="alert" className="rounded-2xl border border-tomato/30 bg-tomato/10 p-4 text-sm text-ink">
          {formError}
        </p>
      )}

      <div className="rounded-2xl border border-crust bg-white p-5 sm:p-6">
        <FieldGroup>
          <Field data-invalid={!!errors.itemName}>
            <FieldLabel htmlFor="itemName">Item name</FieldLabel>
            <Input
              id="itemName"
              maxLength={LIMITS.itemName}
              aria-invalid={!!errors.itemName}
              placeholder="Margherita Pizza"
              {...register("itemName")}
            />
            <FieldError errors={[errors.itemName]} />
          </Field>

          <div className="grid gap-6 sm:grid-cols-3">
            <Field data-invalid={!!errors.category}>
              <FieldLabel htmlFor="category">Category</FieldLabel>
              <NativeSelect className="w-full" id="category" aria-invalid={!!errors.category} {...register("category")}>
                <NativeSelectOption value="">Choose a category</NativeSelectOption>
                {categoryOptions.map((name) => (
                  <NativeSelectOption key={name} value={name}>
                    {name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError errors={[errors.category]} />
            </Field>
            <Field data-invalid={!!errors.location}>
              <FieldLabel htmlFor="location">Location</FieldLabel>
              <Input
                id="location"
                maxLength={LIMITS.location}
                aria-invalid={!!errors.location}
                placeholder="Dhaka"
                {...register("location")}
              />
              <FieldError errors={[errors.location]} />
            </Field>
            <Field data-invalid={!!errors.price}>
              <FieldLabel htmlFor="price">Price</FieldLabel>
              <Input
                id="price"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                aria-invalid={!!errors.price}
                placeholder="450"
                {...register("price")}
              />
              <FieldError errors={[errors.price]} />
            </Field>
          </div>

          <Field data-invalid={!!errors.description}>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              id="description"
              rows={5}
              maxLength={LIMITS.description}
              aria-invalid={!!errors.description}
              placeholder="Tell customers what makes this item good."
              {...register("description")}
            />
            <p className="text-right text-xs text-ink/55">
              {description.length} / {LIMITS.description}
            </p>
            <FieldError errors={[errors.description]} />
          </Field>
        </FieldGroup>
      </div>

      <div className="rounded-2xl border border-crust bg-white p-5 sm:p-6">
        <h2 className="mb-3 font-display text-lg font-bold text-ink">Images</h2>
        <ImageUploader uploads={uploads} invalid={imagesError} />
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <Link href="/vendor/menu" className={outlineButtonClass}>
          Cancel
        </Link>
        <button type="submit" disabled={submitDisabled} className={`${brandButtonClass} h-11 px-6`}>
          {isSubmitting ? "Saving..." : uploads.uploading ? "Uploading images..." : item ? "Save changes" : "Add menu item"}
        </button>
      </div>
    </form>
  );
}
