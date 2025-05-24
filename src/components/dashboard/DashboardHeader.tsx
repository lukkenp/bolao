import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  heading: string;
  subheading?: string;
  className?: string;
}

export function DashboardHeader({
  heading,
  subheading,
  className,
}: DashboardHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
      {subheading && (
        <p className="text-lg text-muted-foreground">
          {subheading}
        </p>
      )}
    </div>
  );
} 