import type { Metadata } from "next";
import { TransactionsView } from "@/components/admin/transactions-view";

export const metadata: Metadata = { title: "Transactions | PizzaHub admin" };

export default function Page() {
  return <TransactionsView />;
}
