import { titleCase } from "@/lib/format";

const styles: Record<string, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  verified: "border-emerald-200 bg-emerald-50 text-emerald-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  processing: "border-cyan-200 bg-cyan-50 text-cyan-700",
  failed: "border-red-200 bg-red-50 text-red-700",
  draft: "border-slate-200 bg-slate-50 text-slate-600",
  under_review: "border-cyan-200 bg-cyan-50 text-cyan-700",
  paused: "border-orange-200 bg-orange-50 text-orange-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
  closed: "border-slate-300 bg-slate-100 text-slate-700",
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm ${
        styles[value] ?? "border-slate-200 bg-slate-50 text-slate-700"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {titleCase(value)}
    </span>
  );
}
