import { formatDate } from "@/lib/format";
import type { AISummary } from "@/lib/types";

import { StatusBadge } from "./StatusBadge";
import { Card } from "./ui";

export function AISummaryPanel({ summaries }: { summaries: AISummary[] }) {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Legal intelligence
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            AI legal summary
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            AI-assisted document summary for review. Not final legal advice.
          </p>
        </div>
        <span className="w-fit rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
          Human review required
        </span>
      </div>
      <div className="mt-5 space-y-4">
        {summaries.length === 0 ? (
          <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-600">
            No AI summaries generated yet.
          </p>
        ) : (
          summaries.map((summary) => (
            <article
              key={summary.id}
              className="overflow-hidden rounded-lg border border-slate-200 bg-white"
            >
              <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/80 p-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="font-semibold">Document summary</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {summary.model_name ?? "Model not set"} · {formatDate(summary.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge value={summary.is_mock ? "pending" : "active"} />
                  <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {summary.is_mock ? "Mock mode" : "OpenAI mode"}
                  </span>
                </div>
              </div>
              <div className="grid gap-0 lg:grid-cols-2">
                <SummaryBlock title="English summary" value={summary.english_summary} />
                <SummaryBlock title="Telugu summary" value={summary.telugu_summary} />
                <SummaryBlock title="Ownership summary" value={summary.ownership_summary} />
                <SummaryBlock title="Document insights" value={summary.document_insights} />
                <SummaryBlock title="Risk flags" value={summary.risk_flags} />
                <SummaryBlock title="Recommended next steps" value={summary.recommended_next_steps} />
              </div>
              <div className="m-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
                {summary.disclaimer ??
                  "AI-assisted summary for preliminary review only. This is not final legal advice."}
              </div>
            </article>
          ))
        )}
      </div>
    </Card>
  );
}

function SummaryBlock({
  title,
  value,
}: {
  title: string;
  value: string | null;
}) {
  return (
    <div className="border-b border-slate-100 p-4 lg:border-r">
      <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </h4>
      <p className="mt-2 text-sm leading-6 text-slate-800">
        {value ?? "Not generated"}
      </p>
    </div>
  );
}
