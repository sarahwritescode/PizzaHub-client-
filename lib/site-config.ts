/**
 * Public contact details and social links shown in the footer.
 *
 * The contact values are demo details for this project. Override them without
 * touching code by setting NEXT_PUBLIC_CONTACT_EMAIL, NEXT_PUBLIC_CONTACT_PHONE
 * and NEXT_PUBLIC_CONTACT_ADDRESS. A value set to an empty string, or `null`
 * here, makes the footer show a "not set yet" note instead of a link.
 *
 *   email:   "hello@your-domain.com"   -> mailto: link
 *   phone:   "+8801XXXXXXXXX"          -> tel: link (digits and a leading +)
 *   address: "Street, City"            -> plain text
 *   socials: full https:// profile URLs
 */

export type SocialPlatform = "x" | "facebook" | "instagram" | "youtube";

export const SITE_CONTACT: {
  email: string | null;
  phone: string | null;
  address: string | null;
} = {
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@pizzahub.demo",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+880 1700-000000",
  address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS ?? "House 12, Road 5, Dhanmondi, Dhaka 1209, Bangladesh",
};

// Platform home pages: the project has no official profiles yet. Replace each
// with the real profile URL when it exists.
export const SOCIAL_LINKS: { platform: SocialPlatform; label: string; url: string | null }[] = [
  { platform: "x", label: "X", url: "https://x.com" },
  { platform: "facebook", label: "Facebook", url: "https://www.facebook.com" },
  { platform: "instagram", label: "Instagram", url: "https://www.instagram.com" },
  { platform: "youtube", label: "YouTube", url: "https://www.youtube.com" },
];

/**
 * Privacy Policy and Terms links. Add an entry only once the page exists,
 * for example { label: "Privacy Policy", href: "/privacy" }. There are no such
 * routes yet, so the footer leaves them out.
 */
export const LEGAL_LINKS: { label: string; href: string }[] = [];
