"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createProject, updateProject } from "@/app/actions/projects";
import type { ProjectFormState } from "@/lib/definitions";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertCircle, Loader2, X, Plus } from "lucide-react";

export const PROJECT_TYPES = [
  "Academic",
  "Hackathon",
  "Open Source",
  "Personal",
  "Research",
  "Other",
] as const;

interface Skill {
  id: string;
  name: string;
}

interface ProjectFormProps {
  availableSkills?: Skill[];
  initialData?: {
    id?: string;
    title: string;
    description?: string | null;
    role?: string | null;
    technologies?: string | null;
    githubUrl?: string | null;
    liveUrl?: string | null;
    imageUrl?: string | null;
    projectType?: string | null;
    teamSize?: number | null;
    requiredSkills?: string[];
    preferredSkills?: string[];
  };
}

export function ProjectForm({ availableSkills = [], initialData }: ProjectFormProps) {
  const isEditing = !!initialData?.id;

  const action = isEditing
    ? updateProject.bind(null, initialData.id!)
    : createProject;

  const [state, formAction, isPending] = useActionState<
    ProjectFormState,
    FormData
  >(action, undefined);

  const [requiredSkills, setRequiredSkills] = useState<string[]>(initialData?.requiredSkills || []);
  const [preferredSkills, setPreferredSkills] = useState<string[]>(initialData?.preferredSkills || []);
  const [reqSkillSelect, setReqSkillSelect] = useState("");
  const [prefSkillSelect, setPrefSkillSelect] = useState("");

  const addRequiredSkill = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!reqSkillSelect) return;
    if (requiredSkills.includes(reqSkillSelect)) return;
    if (preferredSkills.includes(reqSkillSelect)) {
      setPreferredSkills(prev => prev.filter(s => s !== reqSkillSelect));
    }
    setRequiredSkills(prev => [...prev, reqSkillSelect]);
    setReqSkillSelect("");
  };

  const removeRequiredSkill = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setRequiredSkills(prev => prev.filter(s => s !== id));
  };

  const addPreferredSkill = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!prefSkillSelect) return;
    if (preferredSkills.includes(prefSkillSelect)) return;
    if (requiredSkills.includes(prefSkillSelect)) {
      setRequiredSkills(prev => prev.filter(s => s !== prefSkillSelect));
    }
    setPreferredSkills(prev => [...prev, prefSkillSelect]);
    setPrefSkillSelect("");
  };

  const removePreferredSkill = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setPreferredSkills(prev => prev.filter(s => s !== id));
  };

  const getSkillName = (id: string) => availableSkills.find(s => s.id === id)?.name || id;

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden inputs for JSON data */}
      <input type="hidden" name="requiredSkills" value={JSON.stringify(requiredSkills)} />
      <input type="hidden" name="preferredSkills" value={JSON.stringify(preferredSkills)} />

      {/* General error message */}
      {state?.errors?.general && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{state.errors.general[0]}</p>
        </div>
      )}

      {/* Project Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Project Title <span className="text-destructive">*</span>
        </label>
        <Input
          id="title"
          name="title"
          defaultValue={initialData?.title || ""}
          placeholder="e.g. Student Management System or AI Code Assistant"
          required
          disabled={isPending}
          className={cn(state?.errors?.title && "border-destructive")}
        />
        {state?.errors?.title && (
          <p className="text-xs text-destructive">{state.errors.title[0]}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="description" className="text-sm font-medium">
            Description <span className="text-destructive">*</span>
          </label>
          <span className="text-xs text-muted-foreground">
            Min 10 characters
          </span>
        </div>
        <textarea
          id="description"
          name="description"
          defaultValue={initialData?.description || ""}
          required
          rows={5}
          placeholder="Describe your project: what problem does it solve, key features, and your approach..."
          disabled={isPending}
          className={cn(
            "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            state?.errors?.description && "border-destructive"
          )}
        />
        {state?.errors?.description && (
          <p className="text-xs text-destructive">
            {state.errors.description[0]}
          </p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Project Type */}
        <div className="space-y-2">
          <label htmlFor="projectType" className="text-sm font-medium">
            Project Type <span className="text-xs text-muted-foreground">(Optional)</span>
          </label>
          <select
            id="projectType"
            name="projectType"
            defaultValue={initialData?.projectType || ""}
            disabled={isPending}
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              state?.errors?.projectType && "border-destructive"
            )}
          >
            <option value="">Select Project Type</option>
            {PROJECT_TYPES.map(pt => (
              <option key={pt} value={pt}>{pt}</option>
            ))}
          </select>
          {state?.errors?.projectType && (
            <p className="text-xs text-destructive">{state.errors.projectType[0]}</p>
          )}
        </div>

        {/* Team Size */}
        <div className="space-y-2">
          <label htmlFor="teamSize" className="text-sm font-medium">
            Team Size <span className="text-xs text-muted-foreground">(Optional)</span>
          </label>
          <Input
            id="teamSize"
            name="teamSize"
            type="number"
            min={1}
            defaultValue={initialData?.teamSize || ""}
            placeholder="e.g. 4"
            disabled={isPending}
            className={cn(state?.errors?.teamSize && "border-destructive")}
          />
          {state?.errors?.teamSize && (
            <p className="text-xs text-destructive">{state.errors.teamSize[0]}</p>
          )}
        </div>

        {/* Your Role */}
        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-medium">
            Your Role <span className="text-xs text-muted-foreground">(Optional)</span>
          </label>
          <Input
            id="role"
            name="role"
            defaultValue={initialData?.role || ""}
            placeholder="e.g. Lead Frontend Developer, Backend Engineer"
            disabled={isPending}
            className={cn(state?.errors?.role && "border-destructive")}
          />
          {state?.errors?.role && (
            <p className="text-xs text-destructive">{state.errors.role[0]}</p>
          )}
        </div>

        {/* Technologies Used */}
        <div className="space-y-2">
          <label htmlFor="technologies" className="text-sm font-medium">
            Technologies Used <span className="text-xs text-muted-foreground">(Optional)</span>
          </label>
          <Input
            id="technologies"
            name="technologies"
            defaultValue={initialData?.technologies || ""}
            placeholder="e.g. React, Next.js, TypeScript, PostgreSQL"
            disabled={isPending}
            className={cn(state?.errors?.technologies && "border-destructive")}
          />
          <p className="text-xs text-muted-foreground">
            Separate technologies with commas
          </p>
          {state?.errors?.technologies && (
            <p className="text-xs text-destructive">
              {state.errors.technologies[0]}
            </p>
          )}
        </div>

        {/* Project Requirements (Skills) */}
        <div className="space-y-4 sm:col-span-2 border-t pt-4">
          <h3 className="text-lg font-medium">Project Requirements</h3>
          <p className="text-sm text-muted-foreground">Specify the skills needed for this project to help match with potential collaborators.</p>
          
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Required Skills */}
            <div className="space-y-3 p-4 border rounded-md bg-muted/20">
              <label className="text-sm font-semibold">Required Skills</label>
              <div className="flex flex-wrap gap-2 min-h-[32px]">
                {requiredSkills.length === 0 ? (
                  <span className="text-xs text-muted-foreground italic">No required skills</span>
                ) : (
                  requiredSkills.map(id => (
                    <Badge key={id} variant="default" className="flex items-center gap-1 pl-2 pr-1 py-0.5">
                      {getSkillName(id)}
                      <button onClick={(e) => removeRequiredSkill(id, e)} className="hover:bg-primary-foreground/20 rounded-full p-0.5" disabled={isPending}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <select
                  value={reqSkillSelect}
                  onChange={e => setReqSkillSelect(e.target.value)}
                  disabled={isPending}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select a skill...</option>
                  {availableSkills
                    .filter(s => !requiredSkills.includes(s.id))
                    .map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
                <button
                  onClick={addRequiredSkill}
                  disabled={!reqSkillSelect || isPending}
                  className={cn(buttonVariants({ size: "icon", variant: "secondary" }), "h-9 w-9 shrink-0")}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {state?.errors?.requiredSkills && (
                <p className="text-xs text-destructive">{state.errors.requiredSkills[0]}</p>
              )}
            </div>

            {/* Preferred Skills */}
            <div className="space-y-3 p-4 border rounded-md bg-muted/20">
              <label className="text-sm font-semibold">Preferred Skills</label>
              <div className="flex flex-wrap gap-2 min-h-[32px]">
                {preferredSkills.length === 0 ? (
                  <span className="text-xs text-muted-foreground italic">No preferred skills</span>
                ) : (
                  preferredSkills.map(id => (
                    <Badge key={id} variant="secondary" className="flex items-center gap-1 pl-2 pr-1 py-0.5">
                      {getSkillName(id)}
                      <button onClick={(e) => removePreferredSkill(id, e)} className="hover:bg-secondary-foreground/20 rounded-full p-0.5" disabled={isPending}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <select
                  value={prefSkillSelect}
                  onChange={e => setPrefSkillSelect(e.target.value)}
                  disabled={isPending}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select a skill...</option>
                  {availableSkills
                    .filter(s => !preferredSkills.includes(s.id))
                    .map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
                <button
                  onClick={addPreferredSkill}
                  disabled={!prefSkillSelect || isPending}
                  className={cn(buttonVariants({ size: "icon", variant: "secondary" }), "h-9 w-9 shrink-0")}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {state?.errors?.preferredSkills && (
                <p className="text-xs text-destructive">{state.errors.preferredSkills[0]}</p>
              )}
            </div>
          </div>
        </div>

        {/* GitHub URL */}
        <div className="space-y-2">
          <label htmlFor="githubUrl" className="text-sm font-medium">
            GitHub Repository URL <span className="text-xs text-muted-foreground">(Optional)</span>
          </label>
          <Input
            id="githubUrl"
            name="githubUrl"
            type="url"
            defaultValue={initialData?.githubUrl || ""}
            placeholder="https://github.com/username/project"
            disabled={isPending}
            className={cn(state?.errors?.githubUrl && "border-destructive")}
          />
          {state?.errors?.githubUrl && (
            <p className="text-xs text-destructive">
              {state.errors.githubUrl[0]}
            </p>
          )}
        </div>

        {/* Live Demo URL */}
        <div className="space-y-2">
          <label htmlFor="liveUrl" className="text-sm font-medium">
            Live Demo URL <span className="text-xs text-muted-foreground">(Optional)</span>
          </label>
          <Input
            id="liveUrl"
            name="liveUrl"
            type="url"
            defaultValue={initialData?.liveUrl || ""}
            placeholder="https://myproject.vercel.app"
            disabled={isPending}
            className={cn(state?.errors?.liveUrl && "border-destructive")}
          />
          {state?.errors?.liveUrl && (
            <p className="text-xs text-destructive">{state.errors.liveUrl[0]}</p>
          )}
        </div>

        {/* Project Image URL */}
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="imageUrl" className="text-sm font-medium">
            Project Image / Screenshot URL <span className="text-xs text-muted-foreground">(Optional)</span>
          </label>
          <Input
            id="imageUrl"
            name="imageUrl"
            type="url"
            defaultValue={initialData?.imageUrl || ""}
            placeholder="https://images.unsplash.com/photo-... or your image link"
            disabled={isPending}
            className={cn(state?.errors?.imageUrl && "border-destructive")}
          />
          <p className="text-xs text-muted-foreground">
            Paste a public direct image link to display a preview card
          </p>
          {state?.errors?.imageUrl && (
            <p className="text-xs text-destructive">
              {state.errors.imageUrl[0]}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Link
          href={isEditing ? `/projects/${initialData.id}` : "/projects"}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            buttonVariants({ size: "default" }),
            "min-w-[140px]",
            isPending && "opacity-60 cursor-not-allowed"
          )}
        >
          {isPending ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-4 w-4 animate-spin" />
              {isEditing ? "Saving..." : "Creating..."}
            </span>
          ) : isEditing ? (
            "Save Changes"
          ) : (
            "Create Project"
          )}
        </button>
      </div>
    </form>
  );
}
