import { Suspense } from "react";
import { Categories } from "@/components/home/categories";
import { FeaturedPizzas } from "@/components/home/featured-pizzas";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { WhyChooseUs } from "@/components/home/why-choose-us";

// A placeholder with the section's height so the page does not jump when the
// menu data arrives.
function SectionFallback({ className }: { className: string }) {
  return <div aria-hidden="true" className={`${className} min-h-96`} />;
}

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      {/* The menu sections read live data from the backend, so they stream in
          behind Suspense while the static sections render straight away. */}
      <Suspense fallback={<SectionFallback className="bg-white" />}>
        <Categories />
      </Suspense>
      <Suspense fallback={<SectionFallback className="bg-cream" />}>
        <FeaturedPizzas />
      </Suspense>
      <WhyChooseUs />
      <HowItWorks />
    </main>
  );
}
