"use client";

import { useState, useTransition } from "react";
import {
  addUserSkill,
  removeUserSkill,
  updateUserSkillProficiency,
} from "@/app/actions/profile";
import { PROFICIENCY_LEVELS, type ProficiencyLevel } from "@/lib/skills";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, X, Award, Search } from "lucide-react";

interface SkillItem {
  id: string;
  name: string;
  category?: string | null;
}

interface UserSkillItem {
  skillId: string;
  proficiency?: string | null;
  skill: SkillItem;
}

interface SkillsManagerProps {
  availableSkills: SkillItem[];
  userSkills: UserSkillItem[];
}

export function SkillsManager({
  availableSkills,
  userSkills,
}: SkillsManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedSkillId, setSelectedSkillId] = useState<string>("");
  const [selectedProficiency, setSelectedProficiency] =
    useState<ProficiencyLevel>("Intermediate");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  // Existing user skill IDs
  const userSkillIds = new Set(userSkills.map((us) => us.skillId));

  // Available skills not yet added
  const unaddedSkills = availableSkills.filter(
    (skill) => !userSkillIds.has(skill.id)
  );

  // Filter unadded skills by search
  const filteredSkills = unaddedSkills.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.category && s.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillId) return;

    setMessage(null);
    startTransition(async () => {
      try {
        await addUserSkill(selectedSkillId, selectedProficiency);
        setSelectedSkillId("");
        setSearchTerm("");
        setMessage("Skill added successfully!");
        setTimeout(() => setMessage(null), 3000);
      } catch {
        setMessage("Failed to add skill.");
      }
    });
  };

  const handleRemoveSkill = (skillId: string) => {
    setMessage(null);
    startTransition(async () => {
      try {
        await removeUserSkill(skillId);
        setMessage("Skill removed.");
        setTimeout(() => setMessage(null), 3000);
      } catch {
        setMessage("Failed to remove skill.");
      }
    });
  };

  const handleProficiencyChange = (skillId: string, level: string) => {
    startTransition(async () => {
      try {
        await updateUserSkillProficiency(skillId, level);
      } catch {
        setMessage("Failed to update proficiency.");
      }
    });
  };

  const getProficiencyColor = (level?: string | null) => {
    switch (level) {
      case "Advanced":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
      case "Intermediate":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30";
      case "Beginner":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {message && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary">
          {message}
        </div>
      )}

      {/* Add Skill Form */}
      <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          Add a Skill
        </h3>

        <form onSubmit={handleAddSkill} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-12">
            {/* Search / Select Skill */}
            <div className="sm:col-span-6 relative">
              <select
                id="skillSelect"
                value={selectedSkillId}
                onChange={(e) => setSelectedSkillId(e.target.value)}
                disabled={isPending || unaddedSkills.length === 0}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  {unaddedSkills.length === 0
                    ? "All available skills added!"
                    : "Select a skill..."}
                </option>
                {/* Group by category */}
                {Array.from(
                  new Set(unaddedSkills.map((s) => s.category || "Other"))
                ).map((category) => (
                  <optgroup key={category} label={category}>
                    {unaddedSkills
                      .filter((s) => (s.category || "Other") === category)
                      .map((skill) => (
                        <option key={skill.id} value={skill.id}>
                          {skill.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Select Proficiency */}
            <div className="sm:col-span-4">
              <select
                value={selectedProficiency}
                onChange={(e) =>
                  setSelectedProficiency(e.target.value as ProficiencyLevel)
                }
                disabled={isPending}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                {PROFICIENCY_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isPending || !selectedSkillId}
                className={cn(
                  buttonVariants({ size: "default" }),
                  "w-full gap-1.5",
                  (isPending || !selectedSkillId) &&
                    "opacity-50 cursor-not-allowed"
                )}
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* User Skills List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">
            Your Skills ({userSkills.length})
          </h3>
          {userSkills.length > 5 && (
            <div className="relative w-48">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter your skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 w-full rounded-md border border-input bg-transparent pl-8 pr-3 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          )}
        </div>

        {userSkills.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <Award className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium text-foreground">
              No skills added yet
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Select and add skills above with your proficiency level so other students can discover you for projects and teams.
            </p>
          </div>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {userSkills
              .filter((us) =>
                us.skill.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((us) => (
                <div
                  key={us.skillId}
                  className="flex items-center justify-between rounded-lg border bg-card p-3 shadow-sm transition-colors hover:border-border"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-medium text-sm truncate">
                      {us.skill.name}
                    </span>
                    {us.skill.category && (
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {us.skill.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Proficiency dropdown */}
                    <select
                      value={us.proficiency || "Intermediate"}
                      onChange={(e) =>
                        handleProficiencyChange(us.skillId, e.target.value)
                      }
                      disabled={isPending}
                      className={cn(
                        "h-7 rounded border px-2 text-xs font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                        getProficiencyColor(us.proficiency)
                      )}
                    >
                      {PROFICIENCY_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(us.skillId)}
                      disabled={isPending}
                      aria-label={`Remove ${us.skill.name}`}
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
