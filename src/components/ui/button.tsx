import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "quiet" | "ghost";
};

export function Button({ tone = "ghost", className, type = "button", ...props }: Props) {
  return (
    <button
      type={type}
      className={cn(
        "tap inline-flex min-h-11 items-center justify-center gap-2 px-4 font-mono text-sm disabled:cursor-not-allowed disabled:opacity-50",
        tone === "primary" && "bg-copper text-paper",
        tone === "quiet" && "bg-ink text-paper",
        tone === "ghost" && "border border-line bg-paper text-ink",
        className,
      )}
      {...props}
    />
  );
}
