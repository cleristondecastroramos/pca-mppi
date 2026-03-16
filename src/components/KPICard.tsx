import { LucideIcon, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "danger" | "info";
  description?: string;
}

export function KPICard({ title, value, icon: Icon, trend, variant = "default", description }: KPICardProps) {
  const variantStyles = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-destructive/10 text-destructive",
    info: "bg-info/10 text-info",
  };

  const cardHeaderContent = (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
      <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        {title}
        {description && <Info className="h-3 w-3 opacity-50" />}
      </CardTitle>
      <div className={cn("p-1.5 rounded-lg", variantStyles[variant])}>
        <Icon className="h-3 w-3" />
      </div>
    </CardHeader>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card className="hover:shadow-lg transition-shadow h-24 cursor-help">
          {cardHeaderContent}
          <CardContent className="py-0">
            <div className="text-xl font-bold text-foreground leading-tight">{value}</div>
            {trend && (
              <p className={cn("text-xs", trend.isPositive ? "text-success" : "text-destructive")}>
                {trend.value}
              </p>
            )}
          </CardContent>
        </Card>
      </TooltipTrigger>
      {description && (
        <TooltipContent side="bottom" className="max-w-[200px] text-xs">
          <p>{description}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
}
