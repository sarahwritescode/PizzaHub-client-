import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  // Auth server (backend) URL
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [
    // Mirrors the additionalFields defined on the backend `auth.ts`
    inferAdditionalFields({
      user: {
        role: { type: "string", required: false },
        isBlocked: { type: "boolean", required: false, input: false },
        businessName: { type: "string", required: false },
        subscriptionPlan: { type: "string", required: false, input: false },
      },
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
