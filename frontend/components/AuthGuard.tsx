"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useAuth } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

import { LoadingBlock } from "./StateBlock";

export function AuthGuard({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: UserRole[];
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingBlock label="Checking session" />;
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Login required</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to continue this TRUEPLOT workflow.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-flex rounded-md bg-emerald-800 px-4 py-2 text-sm font-semibold text-white"
        >
          Login
        </Link>
      </div>
    );
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-900">
        This page requires a different role.
      </div>
    );
  }

  return children;
}
