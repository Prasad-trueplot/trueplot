"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { useAuth } from "@/lib/auth";
import { Button, ButtonLink, TrueplotLogo } from "./ui";

const navItems = [
  { href: "/properties?listing_type=sale", label: "Buy" },
  { href: "/properties?listing_type=lease", label: "Lease" },
  { href: "/agents", label: "Verified Agents" },
  { href: "/#legal-review", label: "AI Legal Review" },
  { href: "/admin", label: "Admin" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <main className="min-h-screen text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
          <Link href="/" aria-label="TRUEPLOT dashboard" className="shrink-0">
            <TrueplotLogo />
          </Link>
          <nav className="flex flex-wrap items-center gap-1 rounded-full border border-slate-200 bg-slate-50/80 p-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                  isActive(pathname, item.href)
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-600 hover:bg-white hover:text-slate-950"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 md:block">
                  Signed in as {user.full_name}
                </div>
                <Button onClick={handleLogout} variant="secondary" className="px-3">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <ButtonLink href="/login" variant="ghost" className="px-3">
                  Login
                </ButtonLink>
                <ButtonLink href="/signup" variant="primary" className="px-3">
                  Signup
                </ButtonLink>
              </>
            )}
          </div>
        </div>
        {user ? (
          <div className="border-t border-slate-100 bg-white/60">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-5 py-2 text-xs font-medium text-slate-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>{user.full_name}</span>
              <span className="text-slate-300">/</span>
              <span className="capitalize">{user.role.replaceAll("_", " ")}</span>
            </div>
          </div>
        ) : null}
      </header>
      <div className="mx-auto max-w-7xl px-5 py-8">{children}</div>
    </main>
  );
}

function isActive(pathname: string, href: string) {
  const [targetPath] = href.split("?");
  if (targetPath === "/#legal-review") {
    return pathname === "/";
  }
  return pathname === targetPath;
}
