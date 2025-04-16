"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
}

export const Avatar = ({
  src,
  alt = "Аватар",
  fallback = "👤",
  size = "md",
  className,
  ...props
}: AvatarProps) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {!hasError && src ? (
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="object-cover w-full h-full"
        />
      ) : (
        <span className="text-sm">{fallback}</span>
      )}
    </div>
  );
};