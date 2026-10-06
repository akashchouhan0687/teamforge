"use client";

import { useState, useTransition } from "react";
import { sendConnectionRequest } from "@/app/actions/connections";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserPlus, Clock, Check, Loader2 } from "lucide-react";

interface ConnectionButtonProps {
  receiverId: string;
  initialStatus: string | null;
  isSender: boolean;
}

export function ConnectionButton({ receiverId, initialStatus, isSender }: ConnectionButtonProps) {
  const [status, setStatus] = useState<string | null>(initialStatus);
  const [isPending, startTransition] = useTransition();

  const handleConnect = () => {
    if (status === 'pending' || status === 'accepted') return;
    
    startTransition(async () => {
      try {
        await sendConnectionRequest(receiverId);
        setStatus('pending');
      } catch (err: any) {
        alert(err.message || "Failed to send request");
      }
    });
  };

  if (status === 'accepted') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 text-sm font-medium">
        <Check className="h-4 w-4" />
        Connected
      </div>
    );
  }

  if (status === 'pending') {
    if (isSender) {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border bg-muted text-muted-foreground text-sm font-medium">
          <Clock className="h-4 w-4" />
          Request Sent
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-primary/30 bg-primary/10 text-primary text-sm font-medium">
          <Clock className="h-4 w-4" />
          Request Received
        </div>
      );
    }
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isPending}
      className={cn(buttonVariants({ variant: "default" }), "gap-2 shrink-0")}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      Connect
    </button>
  );
}
