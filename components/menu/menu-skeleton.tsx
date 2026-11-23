export function MenuSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-8">
      <div className="flex justify-center gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-10 w-24 rounded-full bg-crust/70 motion-safe:animate-pulse"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex gap-4 rounded-3xl border border-crust bg-surface p-3 sm:gap-5 sm:p-4"
          >
            <div className="size-24 shrink-0 rounded-2xl bg-crust/70 motion-safe:animate-pulse sm:size-36" />
            <div className="flex flex-1 flex-col gap-3 py-1">
              <div className="h-5 w-2/3 rounded-full bg-crust/70 motion-safe:animate-pulse" />
              <div className="h-3 w-full rounded-full bg-crust/50 motion-safe:animate-pulse" />
              <div className="h-3 w-4/5 rounded-full bg-crust/50 motion-safe:animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
