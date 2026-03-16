import { LucideIcon, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

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
  progress?: number;
}

export function KPICard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant = "default", 
  description,
  progress 
}: KPICardProps) {
  const variantStyles = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-destructive/10 text-destructive",
    info: "bg-info/10 text-info",
  };

  const progressStyles = {
    default: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-destructive",
    info: "bg-info",
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
        <Card className="hover:shadow-lg transition-all duration-300 min-h-[105px] cursor-help border-l-4" style={{ 
          borderLeftColor: `hsl(var(--${variant === 'default' ? 'primary' : variant === 'danger' ? 'destructive' : variant}))` 
        }}>
          {cardHeaderContent}
          <CardContent className="py-0">
            <div className="text-xl font-bold text-foreground leading-tight">{value}</div>
            
            {progress !== undefined && (
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-medium">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className={cn(
                    variant === 'default' ? 'text-primary' : `text-${variant}`
                  )}>
                    {progress.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={progress} 
                  className="h-1" 
                  indicatorClassName={progressStyles[variant]}
                />
              </div>
            )}

            {trend && (
              <p className={cn("text-xs mt-1", trend.isPositive ? "text-success" : "text-destructive")}>
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
