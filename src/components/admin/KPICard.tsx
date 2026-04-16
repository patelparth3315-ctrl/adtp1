import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  loading?: boolean;
  className?: string;
}

export function KPICard({ title, value, icon, change, loading, className }: KPICardProps) {
  return (
    <div className={cn("rounded-xl bg-card border border-border p-6 animate-fade-in", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
      <div className="mt-3">
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          <>
            <p className="text-2xl font-bold text-card-foreground">{value}</p>
            {change && <p className="text-xs text-success mt-1">{change}</p>}
          </>
        )}
      </div>
    </div>
  );
}
