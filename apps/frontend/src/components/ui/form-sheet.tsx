"use client";

import * as React from "react";
import { X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "./sheet";
import { Button } from "./button";
import { ScrollArea } from "./scroll-area";
import { cn } from "./utils";

interface FormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  side?: "right" | "left";
  width?: "sm" | "md" | "lg" | "xl";
  showFooter?: boolean;
}

const widthClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
};

export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  onCancel,
  submitLabel = "Simpan",
  cancelLabel = "Batal",
  isSubmitting = false,
  side = "right",
  width = "lg",
  showFooter = true,
}: FormSheetProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={cn("flex flex-col p-0 w-full", widthClasses[width])}
      >
        {/* Header - Fixed */}
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-6">
              <SheetTitle className="text-xl">{title}</SheetTitle>
              {description && (
                <SheetDescription className="mt-1.5">
                  {description}
                </SheetDescription>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <ScrollArea className="flex-1 px-6 py-4">{children}</ScrollArea>

          {/* Footer - Fixed */}
          {showFooter && (
            <SheetFooter className="px-6 py-4 border-t bg-muted/50 flex-row justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                {cancelLabel}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : submitLabel}
              </Button>
            </SheetFooter>
          )}
        </form>
      </SheetContent>
    </Sheet>
  );
}

// Section component untuk organize form fields
interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}
