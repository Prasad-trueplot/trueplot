import { titleCase } from "@/lib/format";

const styles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800",
  verified: "bg-emerald-100 text-emerald-800",
  approved: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  draft: "bg-slate-100 text-slate-700",
  under_review: "bg-blue-100 text-blue-800",
  paused: "bg-orange-100 text-orange-800",
  rejected: "bg-red-100 text-red-800",
  closed: "bg-slate-200 text-slate-800",
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[value] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {titleCase(value)}
    </span>
  );
}

