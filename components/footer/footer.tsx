import Link from "next/link";
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { Brand } from "@/components/navbar/brand";
import { SocialIcon } from "@/components/footer/social-icons";
import { NAV_LINKS } from "@/lib/nav";
import { LEGAL_LINKS, SITE_CONTACT, SOCIAL_LINKS } from "@/lib/site-config";

const linkClass =
  "rounded-sm text-ink/70 outline-none transition-colors hover:text-tomato focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-page";

const headingClass = "font-display text-base font-bold text-ink";

function ContactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  children: ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-tomato/10 text-tomato"
      >
        <Icon className="size-4" strokeWidth={2.25} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-ink/55">{label}</p>
        <div className="mt-0.5 text-sm break-words text-ink">{children}</div>
      </div>
    </li>
  );
}

/** Shown for any contact field that has not been configured yet. */
function NotSet({ what }: { what: string }) {
  return (
    <span className="text-ink/50 italic">
      {what} not set yet <span className="not-italic">(placeholder)</span>
    </span>
  );
}

export function Footer() {
  const { email, phone, address } = SITE_CONTACT;

  return (
    <footer aria-labelledby="footer-heading" className="mt-auto border-t border-crust bg-page">
      <h2 id="footer-heading" className="sr-only">
        PizzaHub footer
      </h2>

      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_0.8fr_1.2fr] lg:gap-16 lg:px-8 lg:py-16">
        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Brand />
          <p className="mt-5 max-w-xs font-display text-2xl leading-snug font-bold tracking-tight text-balance text-ink">
            Serving happiness, one delicious slice at a time.
          </p>

          <ul className="mt-6 flex items-center gap-3" aria-label="Social media">
            {SOCIAL_LINKS.map(({ platform, label, url }) => (
              <li key={platform}>
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`PizzaHub on ${label}`}
                    className="flex size-10 items-center justify-center rounded-full border border-crust bg-surface text-ink transition-colors hover:border-tomato hover:bg-tomato hover:text-cream focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-page focus-visible:outline-none"
                  >
                    <SocialIcon platform={platform} className="size-[1.125rem]" />
                  </a>
                ) : (
                  <span
                    role="img"
                    aria-label={`${label} link not set yet`}
                    title={`${label}: link not set yet`}
                    className="flex size-10 items-center justify-center rounded-full border border-dashed border-crust text-ink/35"
                  >
                    <SocialIcon platform={platform} className="size-[1.125rem]" />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Quick links */}
        <nav aria-labelledby="footer-links-heading">
          <h3 id="footer-links-heading" className={headingClass}>
            Quick links
          </h3>
          <ul className="mt-5 space-y-3 text-sm">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link href={href} className={linkClass}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <h3 className={headingClass}>Contact us</h3>
          <ul className="mt-5 space-y-4">
            <ContactRow icon={MailIcon} label="Email">
              {email ? (
                <a href={`mailto:${email}`} className={linkClass}>
                  {email}
                </a>
              ) : (
                <NotSet what="Email" />
              )}
            </ContactRow>
            <ContactRow icon={PhoneIcon} label="Phone">
              {phone ? (
                <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className={linkClass}>
                  {phone}
                </a>
              ) : (
                <NotSet what="Phone" />
              )}
            </ContactRow>
            <ContactRow icon={MapPinIcon} label="Address">
              {address ?? <NotSet what="Address" />}
            </ContactRow>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-tomato text-cream">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © 2026 PizzaHub. <span className="whitespace-nowrap">All rights reserved.</span>
          </p>
          {LEGAL_LINKS.length > 0 && (
            <ul className="flex flex-wrap gap-x-5 gap-y-1">
              {LEGAL_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-page"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
