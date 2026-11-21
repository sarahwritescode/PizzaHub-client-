import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-3xl font-semibold">PizzaHub</h1>
      <div className="flex gap-3">
        <Link href="/sign-in" className={buttonVariants({ size: "lg" })}>
          Sign in
        </Link>
        <Link href="/sign-up" className={buttonVariants({ variant: "outline", size: "lg" })}>
          Sign up
        </Link>
      </div>
    </main>
  );
}
