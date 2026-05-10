import { formatDate } from "@/lib/format";
import type { AISummary } from "@/lib/types";

import { StatusBadge } from "./StatusBadge";

export function AISummaryPanel({ summaries }: { summaries: AISummary[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">AI legal summary</h2>
        <p className="text-sm text-slate-600">
          AI-assisted document summary for review. Not final legal advice.
        </p>
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
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
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
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <SummaryBlock title="English summary" value={summary.english_summary} />
                <SummaryBlock title="Telugu summary" value={summary.telugu_summary} />
                <SummaryBlock title="Ownership summary" value={summary.ownership_summary} />
                <SummaryBlock title="Document insights" value={summary.document_insights} />
                <SummaryBlock title="Risk flags" value={summary.risk_flags} />
                <SummaryBlock title="Recommended next steps" value={summary.recommended_next_steps} />
              </div>
              <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                {summary.disclaimer ??
                  "AI-assisted summary for preliminary review only. This is not final legal advice."}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
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
    <div>
      <h4 className="text-xs font-semibold uppercase text-slate-500">{title}</h4>
      <p className="mt-1 text-sm leading-6 text-slate-800">{value ?? "Not generated"}</p>
    </div>
  );
}

