"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { useAuth } from "@/lib/auth";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/properties", label: "Listings" },
  { href: "/properties/new", label: "Create" },
  { href: "/agents", label: "Agents" },
  { href: "/admin", label: "Admin" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-[#f6f7f4] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-800 text-sm font-semibold text-white">
              TP
            </span>
            <span>
              <span className="block text-base font-semibold">TRUEPLOT</span>
              <span className="block text-xs text-slate-500">
                Andhra Pradesh verified property workflows
              </span>
            </span>
          </Link>
          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={handleLogout}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="rounded-md bg-emerald-800 px-3 py-2 text-sm font-semibold text-white"
                >
                  Signup
                </Link>
              </>
            )}
          </nav>
        </div>
        {user ? (
          <div className="border-t border-slate-100 bg-slate-50">
            <div className="mx-auto max-w-7xl px-5 py-2 text-xs text-slate-600">
              Signed in as {user.full_name} · {user.role.replaceAll("_", " ")}
            </div>
          </div>
        ) : null}
      </header>
      <div className="mx-auto max-w-7xl px-5 py-6">{children}</div>
    </main>
  );
}
