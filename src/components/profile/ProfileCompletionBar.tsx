import { cn } from "@/lib/utils";
import type { ProfileCompletionResult } from "@/lib/profile";

interface ProfileCompletionBarProps {
  completion: ProfileCompletionResult;
  showMissing?: boolean;
  className?: string;
  compact?: boolean;
}

export function ProfileCompletionBar({
  completion,
  showMissing = true,
  className,
  compact = false,
}: ProfileCompletionBarProps) {
  const { percentage, missingFields } = completion;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">
          Profile Completion
        </span>
        <span className="font-semibold text-primary">{percentage}%</span>
      </div>

      {/* Progress Bar Container */}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            percentage === 100
              ? "bg-emerald-600"
              : percentage >= 50
              ? "bg-primary"
              : "bg-amber-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {showMissing && missingFields.length > 0 && !compact && (
        <p className="text-xs text-muted-foreground pt-1">
          Add <span className="font-medium">{missingFields.slice(0, 3).join(", ")}</span>
          {missingFields.length > 3 ? ` and ${missingFields.length - 3} more` : ""} to reach 100%
        </p>
      )}
    </div>
  );
}
