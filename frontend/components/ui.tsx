import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const buttonStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-slate-950 text-white shadow-sm shadow-slate-950/10 hover:bg-slate-800",
  secondary:
    "border border-slate-200 bg-white text-slate-900 shadow-sm hover:border-slate-300 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
  danger:
    "border border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100",
};

export function TrueplotLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.06]">
        <svg viewBox="0 0 48 48" className="h-11 w-11" aria-hidden="true">
          <path
            d="M11 12.5c0-1.4 1.1-2.5 2.5-2.5h9.2c2 0 3.9.8 5.3 2.2l6.3 6.3c1.4 1.4 2.2 3.3 2.2 5.3v12.7c0 1.4-1.1 2.5-2.5 2.5h-9.6c-2 0-3.9-.8-5.3-2.2l-6.1-6.1c-1.4-1.4-2.2-3.3-2.2-5.3V12.5Z"
            fill="#0f2747"
          />
          <path
            d="M27 10.5c0-.9.7-1.6 1.6-1.6h7.6c1.1 0 2.2.4 3 1.2l4.8 4.8c.8.8 1.2 1.9 1.2 3v14.3c0 .9-.7 1.6-1.6 1.6H36c-1.1 0-2.2-.4-3-1.2l-6.4-6.4c-.8-.8-1.2-1.9-1.2-3V10.5Z"
            fill="#d4a22a"
          />
          <path
            d="M12 35.5h24.5"
            stroke="#2d6b2f"
            strokeWidth="2.3"
            strokeLinecap="round"
          />
          <path
            d="M19 20.5h10.8"
            stroke="#e8eef5"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M19 24.5h10.8"
            stroke="#e8eef5"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M19 28.5h10.8"
            stroke="#e8eef5"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <rect x="22" y="16.2" width="5.8" height="5.8" rx="1.2" fill="#f8fafc" />
          <path
            d="M33.5 33.3h5.8"
            stroke="#d4a22a"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M32.5 28.1c1.3.8 2.3 2.1 2.7 3.8"
            stroke="#2d6b2f"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {!compact ? (
        <div>
          <p className="text-[15px] font-semibold tracking-[0.16em] text-slate-950">
            <span className="text-slate-950">TRUE</span>
            <span className="text-emerald-700">PLOT</span>
          </p>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
            Verified property intelligence
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentPropsWithoutRef<"button"> & { variant?: ButtonVariant }) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${buttonStyles[variant]} ${className}`}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentPropsWithoutRef<typeof Link> & { variant?: ButtonVariant }) {
  return (
    <Link
      {...props}
      className={`inline-flex min-h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition ${buttonStyles[variant]} ${className}`}
    />
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[18px] border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.03] ${className}`}
    >
      {children}
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function FieldShell({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputStyles =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

export function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
      {detail ? <p className="mt-1 text-sm text-slate-500">{detail}</p> : null}
    </Card>
  );
}

export function DetailTile({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-md border border-slate-100 bg-slate-50/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export function MapPreview({
  label = "AP verified plot grid",
}: {
  label?: string;
}) {
  return (
    <div className="relative min-h-56 overflow-hidden rounded-[18px] border border-slate-200 bg-[linear-gradient(180deg,#f8fafc,#eef2f7)]">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] bg-[size:30px_30px]" />
      <div className="absolute left-4 top-4 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 shadow-sm">
        {label}
      </div>
      <div className="absolute inset-x-5 bottom-5 top-16 rounded-2xl border border-slate-200 bg-white/75 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-sm">
        <div className="absolute inset-x-6 top-8 flex items-end justify-between">
          <div className="space-y-2">
            <div className="h-2 w-24 rounded-full bg-slate-200" />
            <div className="h-2 w-36 rounded-full bg-slate-200" />
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
            Verified
          </div>
        </div>
        <div className="absolute inset-x-6 bottom-6 h-24 rounded-2xl bg-[linear-gradient(135deg,rgba(15,39,71,0.95),rgba(45,107,47,0.88))]" />
        <div className="absolute inset-x-10 bottom-12 grid grid-cols-4 gap-2">
          <div className="h-16 rounded-xl bg-white/90 shadow-sm" />
          <div className="h-20 rounded-xl bg-white/90 shadow-sm" />
          <div className="h-14 rounded-xl bg-white/90 shadow-sm" />
          <div className="h-18 rounded-xl bg-white/90 shadow-sm" />
        </div>
      </div>
    </div>
  );
}
