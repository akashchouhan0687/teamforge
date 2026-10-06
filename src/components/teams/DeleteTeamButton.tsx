"use client";

import { useTransition } from "react";
import { deleteTeam } from "@/app/actions/teams";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DeleteTeamButton({ teamId }: { teamId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this team? Members will be removed, but the project will remain intact.")) {
      startTransition(async () => {
        await deleteTeam(teamId);
      });
    }
  };

  return (
    <button 
      type="button" 
      onClick={handleDelete}
      disabled={isPending}
      className={cn(buttonVariants({ variant: "destructive", size: "sm" }), "w-full", isPending && "opacity-50 cursor-not-allowed")}
    >
      {isPending ? "Deleting..." : "Delete Team"}
    </button>
  );
}
