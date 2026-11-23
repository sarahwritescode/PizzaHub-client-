"use client";

import { Bar, BarChart, Cell, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

// One colour per status, shared with the vendor charts.
const STATUS_COLOR = {
  pending: "#d97706",
  approved: "#16a34a",
  accepted: "#16a34a",
  inactive: "#78716c",
  cancelled: "#78716c",
  rejected: "#d93015",
} as const;

const sum = (counts: Record<string, number>, keys: readonly string[]) =>
  keys.reduce((total, key) => total + (counts[key] ?? 0), 0);

export function StatusChart<S extends string>({
  title,
  labels,
  order,
  counts,
  noun,
}: {
  title: string;
  labels: Record<S, string>;
  order: readonly S[];
  counts: Record<S, number>;
  noun: string;
}) {
  const data = order.map((status) => ({
    status,
    label: labels[status],
    count: counts[status] ?? 0,
    fill: STATUS_COLOR[status as keyof typeof STATUS_COLOR],
  }));
  const config: ChartConfig = { count: { label: noun } };

  return (
    <section className="rounded-2xl border border-crust bg-surface p-5" aria-label={title}>
      <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
      {sum(counts, order) === 0 ? (
        <p className="py-16 text-center text-sm text-ink/60">No {noun} yet.</p>
      ) : (
        <ChartContainer config={config} className="mt-4 h-56 w-full">
          <BarChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval={0} fontSize={11} />
            <YAxis allowDecimals={false} domain={[0, (max: number) => Math.max(max, 2)]} tickLine={false} axisLine={false} width={40} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel={false} />} />
            <Bar dataKey="count" radius={6}>
              {data.map((entry) => (
                <Cell key={entry.status} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </section>
  );
}

