"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateTeam } from "@/app/actions/teams";
import { Loader2, Edit2, Check, X } from "lucide-react";

interface EditTeamNameFormProps {
  teamId: string;
  initialName: string;
}

export function EditTeamNameForm({ teamId, initialName }: EditTeamNameFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Team name cannot be empty");
      return;
    }
    if (trimmedName === initialName) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      const formData = new FormData();
      formData.append("name", trimmedName);
      await updateTeam(teamId, formData);
      setIsEditing(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Failed to update team name");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setName(initialName);
    setError("");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-muted/30 p-4 rounded-2xl border border-border/50">
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Edit Team Name</span>
        <div className="space-y-3">
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Enter team name"
            className="font-bold text-foreground text-lg h-auto py-2"
            disabled={isSubmitting}
            autoFocus
          />
          {error && <p className="text-sm font-bold text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={isSubmitting} className="font-bold">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel} disabled={isSubmitting} className="font-bold">
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 flex justify-between items-center group">
      <div>
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Team Name</span>
        <p className="font-bold text-foreground text-lg">{initialName}</p>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        title="Edit Team Name"
      >
        <Edit2 className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  );
}
