import Image from "next/image";
import { PizzaIcon } from "lucide-react";

/** Square thumbnail with a pizza placeholder when there is no usable image. */
export function Thumb({ src, alt, className = "size-20" }: { src?: string; alt: string; className?: string }) {
  const usable = src && /^(https?:|blob:)/i.test(src) ? src : undefined;
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-xl bg-crust ${className}`}>
      {usable ? (
        <Image src={usable} alt={alt} fill unoptimized sizes="96px" className="object-cover" />
      ) : (
        <span aria-hidden="true" className="flex size-full items-center justify-center text-tomato/50">
          <PizzaIcon className="size-1/2" strokeWidth={1.75} />
        </span>
      )}
    </div>
  );
}
