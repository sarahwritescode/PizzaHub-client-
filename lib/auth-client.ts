import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  // In the browser, call this site's own /api/auth/* (next.config.ts rewrites it
  // to the backend) so the session cookie belongs to this domain. On the Next
  // server there is no origin to use, so talk to the backend directly; the
  // cookie is forwarded by hand in lib/session.ts.
  baseURL:
    typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_BETTER_AUTH_URL
      : window.location.origin,
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
