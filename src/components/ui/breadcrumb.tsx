"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";

interface BreadcrumbProps {
  children: React.ReactNode;
  className?: string;
}

export function Breadcrumb({ children, className }: BreadcrumbProps) {
  const items = Array.isArray(children) ? children : [children];
  const filtered = items.filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1 text-label-lg mb-4", className)}>
      {filtered.map((child, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && (
            <Icon name="chevron_right" size={18} className="text-on-surface-variant" />
          )}
          {child}
        </span>
      ))}
    </nav>
  );
}

interface BreadcrumbItemProps {
  href?: string;
  children: React.ReactNode;
}

export function BreadcrumbItem({ href, children }: BreadcrumbItemProps) {
  if (href) {
    return (
      <Link href={href} className="text-primary hover:underline">
        {children}
      </Link>
    );
  }

  return <span className="text-on-surface">{children}</span>;
}
