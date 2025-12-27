import { redirect } from "next/navigation";

export default function AddExpensePage() {
  // Redirect to dashboard on hard navigation (refresh, direct URL, etc.)
  redirect("/dashboard");
}

