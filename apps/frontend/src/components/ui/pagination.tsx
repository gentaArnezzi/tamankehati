import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type AnchorProps = React.ComponentProps<"a"> & {
  isActive?: boolean;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type PaginationProps = Omit<React.ComponentProps<"nav">, "currentPage" | "totalPages" | "totalItems" | "itemsPerPage"> & {
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
};

export function Pagination({ className, currentPage, totalPages, totalItems, itemsPerPage, ...props }: PaginationProps) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("w-full", className)}
      {...props}
    />
  );
}

export function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul className={cn("flex items-center gap-1", className)} {...props} />;
}

export function PaginationItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={cn("list-none", className)} {...props} />;
}

export const PaginationLink = React.forwardRef<HTMLAnchorElement, AnchorProps>(
  ({ className, isActive, ...props }, ref) => (
    <a
      ref={ref}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm",
        "border border-transparent hover:border-gray-200",
        "transition-colors",
        isActive ? "bg-gray-100 font-medium" : "bg-transparent hover:bg-gray-50",
        className,
      )}
      {...props}
    />
  ),
);
PaginationLink.displayName = "PaginationLink";

export const PaginationPrevious = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a">
>(({ className, children, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-md px-3 text-sm",
      "border border-transparent hover:border-gray-200",
      "transition-colors hover:bg-gray-50",
      className,
    )}
    {...props}
  >
    <ChevronLeft className="mr-1 h-4 w-4" />
    <span className="sr-only">Previous</span>
    {children}
  </a>
));
PaginationPrevious.displayName = "PaginationPrevious";

export const PaginationNext = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a">
>(({ className, children, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-md px-3 text-sm",
      "border border-transparent hover:border-gray-200",
      "transition-colors hover:bg-gray-50",
      className,
    )}
    {...props}
  >
    {children}
    <span className="sr-only">Next</span>
    <ChevronRight className="ml-1 h-4 w-4" />
  </a>
));
PaginationNext.displayName = "PaginationNext";

export function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span className={cn("px-2 text-sm text-gray-500", className)} {...props}>
      ...
      <span className="sr-only">More pages</span>
    </span>
  );
}
