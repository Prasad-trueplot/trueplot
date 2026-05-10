"use client";

import { useState } from "react";

import { api } from "@/lib/api";
import type { PropertyRecord } from "@/lib/types";
import { Button, Card } from "./ui";

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
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
        Moderation
      </p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">Admin actions</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          onClick={() =>
            runAction("approve", () =>
              api.updatePropertyStatus(property.id, "active"),
            )
          }
          disabled={busyAction !== null}
        >
          {busyAction === "approve" ? "Approving..." : "Approve listing"}
        </Button>
        <Button
          onClick={() =>
            runAction("verify", () =>
              api.updatePropertyVerification(property.id, true, "verified"),
            )
          }
          disabled={busyAction !== null}
          variant="secondary"
        >
          {busyAction === "verify" ? "Verifying..." : "Mark verified"}
        </Button>
        <Button
          onClick={() =>
            runAction("pause", () =>
              api.updatePropertyStatus(property.id, "paused"),
            )
          }
          disabled={busyAction !== null}
          variant="ghost"
        >
          Pause listing
        </Button>
      </div>
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </Card>
  );
}
