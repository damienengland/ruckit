import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "text-2xl",
  md: "text-4xl",
  lg: "text-6xl",
  xl: "text-8xl",
};

export function Logo({ className, size = "lg" }: LogoProps) {
  return (
    <h1
      className={cn(
        "text-white tracking-wider",
        sizeClasses[size],
        className
      )}
      style={{ fontFamily: "var(--font-luckiest-guy)" }}
    >
      RUCKIT!
    </h1>
  );
}
