/**
 * Public contact details and social links shown in the footer.
 *
 * PLACEHOLDERS: no verified contact information exists in the project yet, so
 * every value below is `null`. The footer shows a clearly marked "not set yet"
 * note for a `null` field and never renders it as a link. Fill a value in to
 * turn it on:
 *
 *   email:   "hello@your-domain.com"   -> mailto: link
 *   phone:   "+8801XXXXXXXXX"          -> tel: link (digits and a leading +)
 *   address: "Street, City"            -> plain text
 *   socials: full https:// profile URLs
 */

export type SocialPlatform = "facebook" | "instagram" | "youtube";

export const SITE_CONTACT: {
  email: string | null;
  phone: string | null;
  address: string | null;
} = {
  email: null,
  phone: null,
  address: null,
};

export const SOCIAL_LINKS: { platform: SocialPlatform; label: string; url: string | null }[] = [
  { platform: "facebook", label: "Facebook", url: null },
  { platform: "instagram", label: "Instagram", url: null },
  { platform: "youtube", label: "YouTube", url: null },
];

/**
 * Privacy Policy and Terms links. Add an entry only once the page exists,
 * for example { label: "Privacy Policy", href: "/privacy" }. There are no such
 * routes yet, so the footer leaves them out.
 */
export const LEGAL_LINKS: { label: string; href: string }[] = [];
