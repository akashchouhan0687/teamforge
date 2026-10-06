"use client";

import { useState, useTransition } from "react";
import { deleteProject } from "@/app/actions/projects";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteProjectButtonProps {
  projectId: string;
  projectTitle: string;
  className?: string;
}

export function DeleteProjectButton({
  projectId,
  projectTitle,
  className,
}: DeleteProjectButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteProject(projectId);
      } catch (err) {
        console.error("Failed to delete project:", err);
      }
    });
  };

  if (isConfirming) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={isPending}
          onClick={handleDelete}
          className={cn(
            buttonVariants({ variant: "destructive", size: "sm" }),
            "h-8 px-2 text-xs"
          )}
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            "Confirm Delete"
          )}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => setIsConfirming(false)}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-8 px-2 text-xs"
          )}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsConfirming(true)}
      disabled={isPending}
      aria-label={`Delete ${projectTitle}`}
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "h-8 px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
        className
      )}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
