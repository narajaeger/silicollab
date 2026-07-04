// Design system SiliCollab — primitif berbasis Tailwind (light + dark)
"use client";

import Link from "next/link";
import {
  createContext,
  useContext,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from "react";

// ---------------------------------------------------------------------
// util
// ---------------------------------------------------------------------
export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

// ---------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------
type ButtonVariant =
  | "primary"
  | "outline"
  | "ghost"
  | "subtle"
  | "success"
  | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm",
  outline:
    "border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800",
  ghost:
    "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
  subtle:
    "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
  danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
  icon: "h-9 w-9 text-sm",
};

export function Button({
  className = "",
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      className={cn(buttonBase, buttonVariants[variant], buttonSizes[size], className)}
      {...props}
    />
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(buttonBase, buttonVariants[variant], buttonSizes[size], className)}
    >
      {children}
    </Link>
  );
}

// ---------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------
const fieldBase =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, className)} {...props} />;
}

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, "resize-y", className)} {...props} />;
}

export function Select({
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(fieldBase, "pr-8", className)} {...props}>
      {children}
    </select>
  );
}

export function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <label className={cn("mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300", className)}>
      {children}
    </label>
  );
}

// ---------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn("font-semibold text-slate-900 dark:text-slate-100", className)}>{children}</h2>
  );
}

// ---------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------
type BadgeTone = "brand" | "slate" | "emerald" | "amber" | "rose" | "violet";
const badgeTones: Record<BadgeTone, string> = {
  brand: "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200",
  slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  rose: "bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  violet: "bg-violet-50 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
};

export function Badge({
  children,
  tone = "brand",
  className = "",
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        badgeTones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------
function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "?"
  );
}

const avatarColors = [
  "bg-brand-100 text-brand-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
];

export function Avatar({
  name,
  size = 32,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const idx = (name.charCodeAt(0) || 0) % avatarColors.length;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        avatarColors[idx],
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials(name)}
    </span>
  );
}

// ---------------------------------------------------------------------
// Tabs (link-based)
// ---------------------------------------------------------------------
export function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "whitespace-nowrap border-b-2 px-1 pb-2.5 pt-1 text-sm font-medium transition",
        active
          ? "border-brand-600 text-brand-700 dark:text-brand-300"
          : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      )}
    >
      {children}
    </Link>
  );
}

// ---------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------
export function Modal({
  open,
  onClose,
  title,
  children,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg animate-fade-in rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900",
          className
        )}
      >
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              aria-label="Tutup"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Drawer (kanan)
// ---------------------------------------------------------------------
export function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md animate-slide-in flex-col border-l border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700" aria-label="Tutup">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={cn(
        "skeleton rounded-md bg-slate-200 dark:bg-slate-800",
        className
      )}
    />
  );
}

// ---------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------
export function EmptyState({
  icon = "📭",
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/50 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
      <div className="mb-3 text-4xl">{icon}</div>
      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------
type ToastTone = "success" | "error" | "info";
type ToastItem = { id: number; message: string; tone: ToastTone };
type ToastCtx = { push: (message: string, tone?: ToastTone) => void };

const ToastContext = createContext<ToastCtx | null>(null);

export function useToast(): ToastCtx {
  const ctx = useContext(ToastContext);
  // Fallback aman bila provider belum terpasang
  return ctx ?? { push: () => {} };
}

const toastTones: Record<ToastTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
  info: "border-slate-200 bg-white text-slate-800",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  function push(message: string, tone: ToastTone = "info") {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3500);
  }

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto animate-slide-in rounded-lg border px-4 py-2.5 text-sm shadow-lg",
              toastTones[t.tone]
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
