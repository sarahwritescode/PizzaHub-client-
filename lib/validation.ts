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
