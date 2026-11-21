import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Flame, MapPin } from "lucide-react";
import { Reveal } from "@/components/home/reveal";
import heroPizza from "@/public/images/hero-pizza.jpg";

const ctaBase =
  "group inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-base font-semibold outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-cream motion-safe:active:scale-[0.98]";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden bg-cream"
    >
      {/* Background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-32 -z-10 size-104 rounded-full bg-crust/70 lg:size-136"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-1/3 -z-10 hidden size-48 rounded-full border-2 border-dashed border-tomato/25 sm:block"
      />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:min-h-[calc(100svh-72px)] lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:px-8 lg:py-20">
        {/* Copy */}
        <div className="flex flex-col items-start">
          <Reveal y={16}>
            <p className="inline-flex items-center gap-2 rounded-full border border-crust bg-white/70 py-1.5 pr-4 pl-2 text-sm font-medium text-ink">
              <span className="flex size-6 items-center justify-center rounded-full bg-tomato text-cream">
                <MapPin className="size-3.5" strokeWidth={2.5} />
              </span>
              Pizza from your favourite local kitchens
            </p>
          </Reveal>

          <Reveal y={24} delay={0.08}>
            <h1
              id="hero-heading"
              className="mt-6 font-display text-[2.75rem] leading-[0.98] font-extrabold tracking-tight text-balance text-ink sm:text-6xl lg:text-[4.5rem] xl:text-[5.25rem]"
            >
              Craving something delicious?
            </h1>
          </Reveal>

          <Reveal y={24} delay={0.16}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/70">
              Pick a pizza from restaurants near you and get it delivered hot,
              straight to your door.
            </p>
          </Reveal>

          <Reveal y={24} delay={0.24} className="w-full">
            <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Link
                href="/menu"
                className={`${ctaBase} bg-tomato text-cream shadow-[0_10px_24px_-10px_rgb(217_48_21/0.7)] hover:bg-tomato-deep`}
              >
                Explore Menu
                <ArrowRight
                  aria-hidden="true"
                  className="size-5 transition-transform duration-200 motion-safe:group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/menu"
                className={`${ctaBase} border-2 border-ink bg-transparent text-ink hover:bg-ink hover:text-cream`}
              >
                Order Now
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Visual */}
        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div className="relative mx-auto aspect-square w-full max-w-136 lg:max-w-152">
            <div
              aria-hidden="true"
              className="absolute top-0 right-0 aspect-square w-[88%] rounded-full bg-tomato"
            />

            <Reveal
              fade={false}
              scale={0.92}
              rotate={-10}
              delay={0.1}
              className="absolute bottom-0 left-0 aspect-square w-[88%]"
            >
              <div className="relative size-full overflow-hidden rounded-full shadow-[0_30px_60px_-20px_rgb(28_23_19/0.55)] ring-10 ring-cream">
                <Image
                  src={heroPizza}
                  alt="A freshly baked Margherita pizza with melted mozzarella and basil leaves"
                  fill
                  preload
                  placeholder="blur"
                  sizes="(min-width: 1024px) 34vw, (min-width: 640px) 30rem, 88vw"
                  className="object-cover object-[55%_55%]"
                />
              </div>
            </Reveal>

            <Reveal y={20} delay={0.5} className="absolute right-0 bottom-[10%]">
              <div className="flex items-center gap-3 rounded-2xl bg-white py-3 pr-5 pl-3 shadow-[0_16px_40px_-16px_rgb(28_23_19/0.45)]">
                <span className="flex size-10 items-center justify-center rounded-xl bg-tomato/10 text-tomato">
                  <Flame className="size-5" strokeWidth={2.25} />
                </span>
                <span className="text-sm leading-tight font-semibold text-ink">
                  Baked fresh,
                  <br />
                  delivered hot
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
