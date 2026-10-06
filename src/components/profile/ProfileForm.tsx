"use client";

import { useActionState, useState } from "react";
import { updateProfile } from "@/app/actions/profile";
import type { ProfileFormState } from "@/lib/definitions";
import { COMMON_DEPARTMENTS, ACADEMIC_YEARS } from "@/lib/profile";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface ProfileFormProps {
  initialData: {
    name: string;
    department?: string | null;
    year?: string | null;
    bio?: string | null;
    location?: string | null;
    profileImage?: string | null;
    interests?: string | null;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState<
    ProfileFormState,
    FormData
  >(updateProfile, undefined);

  const [bioCharCount, setBioCharCount] = useState(
    initialData.bio?.length || 0
  );

  return (
    <form action={formAction} className="space-y-6">
      {/* Success Notification */}
      {state?.success && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{state.message}</p>
        </div>
      )}

      {/* General Error Notification */}
      {state?.errors?.general && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{state.errors.general[0]}</p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Full Name */}
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="name" className="text-sm font-medium">
            Full Name <span className="text-destructive">*</span>
          </label>
          <Input
            id="name"
            name="name"
            defaultValue={initialData.name}
            placeholder="e.g. Alex Johnson"
            required
            disabled={isPending}
            className={cn(state?.errors?.name && "border-destructive")}
          />
          {state?.errors?.name && (
            <p className="text-xs text-destructive">{state.errors.name[0]}</p>
          )}
        </div>

        {/* Department */}
        <div className="space-y-2">
          <label htmlFor="department" className="text-sm font-medium">
            Department / Major <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <input
              id="department"
              name="department"
              defaultValue={initialData.department || ""}
              list="departments-list"
              placeholder="e.g. Computer Science"
              required
              disabled={isPending}
              className={cn(
                "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                state?.errors?.department && "border-destructive"
              )}
            />
            <datalist id="departments-list">
              {COMMON_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept} />
              ))}
            </datalist>
          </div>
          {state?.errors?.department && (
            <p className="text-xs text-destructive">
              {state.errors.department[0]}
            </p>
          )}
        </div>

        {/* Academic Year */}
        <div className="space-y-2">
          <label htmlFor="year" className="text-sm font-medium">
            Academic Year <span className="text-destructive">*</span>
          </label>
          <select
            id="year"
            name="year"
            defaultValue={initialData.year || ""}
            required
            disabled={isPending}
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              state?.errors?.year && "border-destructive"
            )}
          >
            <option value="" disabled>
              Select your year
            </option>
            {ACADEMIC_YEARS.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
          {state?.errors?.year && (
            <p className="text-xs text-destructive">{state.errors.year[0]}</p>
          )}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-medium">
            Location <span className="text-xs text-muted-foreground">(Optional)</span>
          </label>
          <Input
            id="location"
            name="location"
            defaultValue={initialData.location || ""}
            placeholder="e.g. Berkeley, CA or Campus North"
            disabled={isPending}
            className={cn(state?.errors?.location && "border-destructive")}
          />
          {state?.errors?.location && (
            <p className="text-xs text-destructive">
              {state.errors.location[0]}
            </p>
          )}
        </div>

        {/* Profile Photo URL */}
        <div className="space-y-2">
          <label htmlFor="profileImage" className="text-sm font-medium">
            Profile Photo URL <span className="text-xs text-muted-foreground">(Optional)</span>
          </label>
          <Input
            id="profileImage"
            name="profileImage"
            type="url"
            defaultValue={initialData.profileImage || ""}
            placeholder="https://example.com/photo.jpg"
            disabled={isPending}
            className={cn(state?.errors?.profileImage && "border-destructive")}
          />
          {state?.errors?.profileImage && (
            <p className="text-xs text-destructive">
              {state.errors.profileImage[0]}
            </p>
          )}
        </div>

        {/* Short Bio */}
        <div className="space-y-2 sm:col-span-2">
          <div className="flex items-center justify-between">
            <label htmlFor="bio" className="text-sm font-medium">
              Short Bio <span className="text-xs text-muted-foreground">(Optional)</span>
            </label>
            <span className="text-xs text-muted-foreground">
              {bioCharCount}/500
            </span>
          </div>
          <textarea
            id="bio"
            name="bio"
            defaultValue={initialData.bio || ""}
            onChange={(e) => setBioCharCount(e.target.value.length)}
            maxLength={500}
            rows={4}
            placeholder="Tell fellow students about yourself, what you're working on, or what teams you want to join..."
            disabled={isPending}
            className={cn(
              "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              state?.errors?.bio && "border-destructive"
            )}
          />
          {state?.errors?.bio && (
            <p className="text-xs text-destructive">{state.errors.bio[0]}</p>
          )}
        </div>

        {/* Interests */}
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="interests" className="text-sm font-medium">
            Interests & Hobbies <span className="text-xs text-muted-foreground">(Optional)</span>
          </label>
          <Input
            id="interests"
            name="interests"
            defaultValue={initialData.interests || ""}
            placeholder="e.g. AI Research, Hackathons, Game Dev, Robotics, Open Source"
            disabled={isPending}
            className={cn(state?.errors?.interests && "border-destructive")}
          />
          <p className="text-xs text-muted-foreground">
            Separate interests with commas (e.g. Hackathons, Web3, UI Design)
          </p>
          {state?.errors?.interests && (
            <p className="text-xs text-destructive">
              {state.errors.interests[0]}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            buttonVariants({ size: "default" }),
            "w-full sm:w-auto min-w-[140px]",
            isPending && "opacity-60 cursor-not-allowed"
          )}
        >
          {isPending ? "Saving Profile..." : "Save Profile"}
        </button>
      </div>
    </form>
  );
}
