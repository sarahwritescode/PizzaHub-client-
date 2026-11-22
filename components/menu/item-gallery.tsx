"use client";

import Image from "next/image";
import { useState } from "react";
import { PizzaIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Large image with a thumbnail strip when the item has more than one photo. */
export function ItemGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-crust bg-crust">
        {current ? (
          <Image
            key={current}
            src={current}
            alt={name}
            fill
            priority
            // Image hosts are not known ahead of time (see menu-card.tsx).
            unoptimized
            sizes="(min-width: 1024px) 36rem, 100vw"
            className="object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-full items-center justify-center text-tomato/40"
          >
            <PizzaIcon className="size-24" strokeWidth={1.5} />
          </span>
        )}
      </div>

      {images.length > 1 && (
        <ul className="flex flex-wrap gap-3" aria-label="More photos">
          {images.map((src, index) => (
            <li key={`${src}-${index}`}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show photo ${index + 1} of ${images.length}`}
                aria-pressed={index === active}
                className={cn(
                  "relative block size-16 overflow-hidden rounded-2xl border-2 bg-crust outline-none transition-[border-color,opacity] focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-cream sm:size-20",
                  index === active
                    ? "border-tomato"
                    : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  unoptimized
                  sizes="5rem"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
