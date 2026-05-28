"use client";

import { cn } from "@/lib/utils";
import React, { useState } from "react";

interface TMULogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  containerClassName?: string;
}

const sizeMap = {
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-24 w-24",
};

export function TMULogo({ size = "md", className, containerClassName }: TMULogoProps) {
  return (
    <div className={cn("flex items-center justify-center shrink-0", sizeMap[size], containerClassName)}>
      <img
        src="/tmu-logo.png?v=2"
        alt="TMU Logo"
        className={cn("h-full w-full object-contain drop-shadow-sm", className)}
      />
    </div>
  );
}
