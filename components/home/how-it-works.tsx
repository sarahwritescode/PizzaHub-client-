import { InView } from "@/components/home/in-view";
import { HOW_IT_WORKS_STEPS } from "@/lib/features";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="relative overflow-hidden bg-cream"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <InView className="mx-auto max-w-2xl text-center">
          <h2
            id="how-heading"
            className="font-display text-3xl leading-tight font-extrabold tracking-tight text-balance text-ink sm:text-4xl lg:text-5xl"
          >
            How PizzaHub Works
          </h2>
          <p className="mt-4 text-base text-ink/70 text-pretty sm:text-lg">
            From craving to doorstep in four simple steps.
          </p>
        </InView>

        <ol className="mt-10 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {HOW_IT_WORKS_STEPS.map(({ id, title, description, icon: Icon }, index) => (
            <li key={id}>
              <InView className="h-full" delay={index * 0.08}>
                <article className="relative h-full rounded-[2rem] border border-crust bg-white p-6 sm:p-7">
                  <span
                    aria-hidden="true"
                    className="absolute top-5 right-6 font-display text-5xl leading-none font-extrabold text-tomato/15"
                  >
                    {index + 1}
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex size-14 items-center justify-center rounded-full bg-tomato text-cream"
                  >
                    <Icon className="size-7" strokeWidth={2} />
                  </span>
                  <h3 className="mt-6 font-display text-xl leading-tight font-bold text-ink">
                    <span className="sr-only">Step {index + 1}: </span>
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/65 text-pretty sm:text-base">
                    {description}
                  </p>
                </article>
              </InView>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
