import { InView } from "@/components/home/in-view";
import { WHY_CHOOSE_FEATURES } from "@/lib/features";

export function WhyChooseUs() {
  return (
    <section
      id="why-pizzahub"
      aria-labelledby="why-heading"
      className="relative overflow-hidden bg-surface"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <InView className="mx-auto max-w-2xl text-center">
          <h2
            id="why-heading"
            className="font-display text-3xl leading-tight font-extrabold tracking-tight text-balance text-ink sm:text-4xl lg:text-5xl"
          >
            Why PizzaHub is Your Perfect Slice?
          </h2>
          <p className="mt-4 text-base text-ink/70 text-pretty sm:text-lg">
            More than just pizza — we bring quality, freshness and happiness to
            every bite.
          </p>
        </InView>

        <ul className="mt-10 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-6">
          {WHY_CHOOSE_FEATURES.map(({ id, title, description, icon: Icon }, index) => (
            <li key={id}>
              <InView className="h-full" delay={index * 0.08}>
                <article className="group h-full rounded-[2rem] border border-crust bg-page p-6 transition-[transform,box-shadow,background-color] duration-300 hover:bg-surface hover:shadow-[0_24px_48px_-24px_rgb(28_23_19/0.35)] motion-safe:hover:-translate-y-1.5 sm:p-7">
                  <span
                    aria-hidden="true"
                    className="flex size-14 items-center justify-center rounded-full bg-tomato/10 text-tomato transition-colors duration-300 group-hover:bg-tomato group-hover:text-cream"
                  >
                    <Icon
                      className="size-7 transition-transform duration-300 motion-safe:group-hover:scale-110"
                      strokeWidth={2}
                    />
                  </span>
                  <h3 className="mt-6 font-display text-xl leading-tight font-bold text-ink">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/65 text-pretty sm:text-base">
                    {description}
                  </p>
                </article>
              </InView>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
