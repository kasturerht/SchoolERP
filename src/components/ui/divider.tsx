import { cn } from "@/lib/utils";

interface DividerProps {
  className?: string;
  inset?: boolean;
  vertical?: boolean;
}

export function Divider({ className, inset = false, vertical = false }: DividerProps) {
  if (vertical) {
    return (
      <div
        className={cn(
          "w-px self-stretch bg-outline-variant",
          inset && "my-2",
          className
        )}
      />
    );
  }

  return (
    <hr
      className={cn(
        "border-0 h-px bg-outline-variant",
        inset && "mx-4",
        className
      )}
    />
  );
}
