// src/components/ui/badge.tsx

import React from "react";
import { cn } from "@/lib/utils"; // Убедись, что `cn` есть. Иначе убери его.

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary";
}

export const Badge = ({ className, variant = "default", ...props }: BadgeProps) => {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variant === "default" ? "bg-primary text-white" : "bg-muted text-muted-foreground",
        className
      )}
      {...props}
    />
  );
};