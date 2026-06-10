import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ALL_VALUE = "__all__";
const CONTRATO_VIGENTE = "__contrato_vigente__";

interface TipoContratacaoFilterProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  triggerClassName?: string;
}

export function TipoContratacaoFilter({
  value,
  onValueChange,
  className,
  triggerClassName,
}: TipoContratacaoFilterProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);

  // Helper to get display label
  const getDisplayValue = () => {
    if (!value || value === ALL_VALUE) return "Todos";
    if (value === "Nova Contratação") return "Nova Contratação";
    if (value === CONTRATO_VIGENTE) return "Contrato Vigente";
    return value; // 'Renovação', 'Apostilamento', etc.
  };

  const handleSelect = (newValue: string) => {
    onValueChange(newValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
            triggerClassName
          )}
        >
          <span className="truncate">{getDisplayValue()}</span>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("p-1", className)}
        style={{ width: "var(--radix-popover-trigger-width)" }}
        align="start"
      >
        <div className="flex flex-col gap-0.5">
          <div
            onClick={() => handleSelect(ALL_VALUE)}
            className="flex items-center rounded-sm px-2 py-1.5 text-xs cursor-pointer hover:bg-accent hover:text-accent-foreground"
          >
            <Check
              className={cn(
                "mr-2 h-4 w-4 shrink-0",
                value === ALL_VALUE ? "opacity-100" : "opacity-0"
              )}
            />
            Todos
          </div>

          <div
            onClick={() => handleSelect("Nova Contratação")}
            className="flex items-center rounded-sm px-2 py-1.5 text-xs cursor-pointer hover:bg-accent hover:text-accent-foreground"
          >
            <Check
              className={cn(
                "mr-2 h-4 w-4 shrink-0",
                value === "Nova Contratação" ? "opacity-100" : "opacity-0"
              )}
            />
            Nova Contratação
          </div>

          <div className="flex items-center justify-between rounded-sm pr-2 hover:bg-accent hover:text-accent-foreground">
            <div
              className="flex items-center flex-1 py-1.5 pl-2 text-xs cursor-pointer"
              onClick={() => handleSelect(CONTRATO_VIGENTE)}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4 shrink-0",
                  value === CONTRATO_VIGENTE ? "opacity-100" : "opacity-0"
                )}
              />
              Contrato Vigente
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="p-1 rounded-sm hover:bg-muted text-muted-foreground"
            >
              {expanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          </div>

          {expanded && (
            <div className="pl-6 flex flex-col gap-0.5">
              {["Renovação", "Apostilamento", "Aditivo Quantitativo", "Repactuação"].map(
                (child) => (
                  <div
                    key={child}
                    onClick={() => handleSelect(child)}
                    className="flex items-center rounded-sm px-2 py-1.5 text-xs cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        value === child ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {child}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
