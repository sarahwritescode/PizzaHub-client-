/**
 * Brand button classes. Plain strings (not a component) so they work on
 * <button>, <Link> and <a> in both server and client components.
 */
export const brandButtonClass =
  "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-tomato px-4 text-sm font-semibold text-white outline-none transition-colors hover:bg-tomato-deep focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4";

export const outlineButtonClass =
  "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full border border-crust bg-surface px-4 text-sm font-semibold text-ink outline-none transition-colors hover:border-tomato focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4";

export const dangerButtonClass =
  "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full border border-tomato/40 bg-surface px-4 text-sm font-semibold text-tomato outline-none transition-colors hover:bg-tomato/10 focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4";
