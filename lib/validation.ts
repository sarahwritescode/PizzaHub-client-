import { z } from "zod";
import { SIGNUP_ROLES } from "./roles";

// Same rules as the backend: min 6 chars, one uppercase, one lowercase.
export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters.")
  .max(128, "Password must be at most 128 characters.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.");

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters."),
  email: z.email("Enter a valid email address."),
  password: passwordSchema,
  image: z
    .union([z.literal(""), z.url("Enter a valid image URL.")])
    .optional(),
  role: z.enum(SIGNUP_ROLES),
});
export type SignUpValues = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.email("Enter a valid email address."),
  // No strength rules on sign-in, only that it is filled in.
  password: z.string().min(1, "Password is required."),
});
export type SignInValues = z.infer<typeof signInSchema>;

// Profile Settings: only name, image and (for vendors) business name are
// editable. The role, email and subscription are never part of this form, and
// the backend refuses them as well.
export const profileSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters.").max(100, "Full name must be at most 100 characters."),
  image: z
    .union([
      z.literal(""),
      z.url({ protocol: /^https?$/, message: "Enter a valid http(s) image URL." }).max(2048, "That URL is too long."),
    ])
    .optional(),
  businessName: z.string().trim().max(100, "Business name must be at most 100 characters.").optional(),
});
export type ProfileValues = z.infer<typeof profileSchema>;
