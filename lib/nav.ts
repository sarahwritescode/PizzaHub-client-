export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Browse menu", href: "/menu" },
] as const;

export type NavLink = { label: string; href: string };

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
