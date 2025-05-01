import * as React from "react";
import { cn } from "../../lib/utils";

interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: "default" | "success" | "warning" | "error";
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, variant = "default", ...props }, ref) => {
    const percentage = (value / max) * 100;
    
    const getVariantClass = () => {
      switch (variant) {
        case "success": return "bg-success-500";
        case "warning": return "bg-warning-500";
        case "error": return "bg-error-500";
        default: return "bg-primary-500";
      }
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-muted h-4",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full w-full flex-1 transition-all",
            getVariantClass()
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };