"use client";

import { useState } from "react";

import { api } from "@/lib/api";
import type { PropertyRecord } from "@/lib/types";

export function PropertyActions({
  property,
  onChange,
}: {
  property: PropertyRecord;
  onChange: (property: PropertyRecord) => void;
}) {
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAction(
    key: string,
    action: () => Promise<PropertyRecord>,
  ) {
    setBusyAction(key);
    setError(null);
    try {
      onChange(await action());
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "Action failed",
      );
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Admin actions</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() =>
            runAction("approve", () =>
              api.updatePropertyStatus(property.id, "active"),
            )
          }
          disabled={busyAction !== null}
          className="rounded-md bg-emerald-800 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busyAction === "approve" ? "Approving..." : "Approve listing"}
        </button>
        <button
          onClick={() =>
            runAction("verify", () =>
              api.updatePropertyVerification(property.id, true, "verified"),
            )
          }
          disabled={busyAction !== null}
          className="rounded-md border border-emerald-800 px-3 py-2 text-sm font-semibold text-emerald-900 disabled:opacity-60"
        >
          {busyAction === "verify" ? "Verifying..." : "Mark verified"}
        </button>
        <button
          onClick={() =>
            runAction("pause", () =>
              api.updatePropertyStatus(property.id, "paused"),
            )
          }
          disabled={busyAction !== null}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
        >
          Pause listing
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}

