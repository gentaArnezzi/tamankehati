"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "./utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // Base styles
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
        // Border
        "border-2 border-transparent",
        // Transitions
        "transition-all duration-200 ease-in-out",
        // Unchecked state - Professional gray
        "data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-slate-700",
        // Checked state - Professional emerald/green
        "data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:bg-emerald-500",
        // Hover states
        "hover:data-[state=unchecked]:bg-slate-300 dark:hover:data-[state=unchecked]:bg-slate-600",
        "hover:data-[state=checked]:bg-emerald-700 dark:hover:data-[state=checked]:bg-emerald-600",
        // Focus states - Minimal ring
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Shadow for depth
        "shadow-sm",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // Base styles - Clean white thumb
          "pointer-events-none block h-5 w-5 rounded-full",
          "bg-white shadow-md",
          // Transition
          "transition-transform duration-200 ease-in-out",
          // Position
          "data-[state=unchecked]:translate-x-0",
          "data-[state=checked]:translate-x-5",
          // Ring for better visibility
          "ring-0",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
