"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "@/app/actions/auth";
import type { RegisterFormState } from "@/lib/definitions";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function RegisterForm() {
  const [state, action, pending] = useActionState<RegisterFormState, FormData>(
    register,
    undefined
  );

  return (
    <form action={action} className="space-y-5">
      {/* General error */}
      {state?.errors?.general && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive/50" />
          <p className="text-sm font-bold text-destructive pl-2">{state.errors.general[0]}</p>
        </div>
      )}

      {/* Name */}
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">
          Full Name
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Alex Johnson"
          autoComplete="name"
          aria-describedby="name-error"
          disabled={pending}
          className="rounded-2xl h-12 px-4 bg-background border-border/50 focus:ring-2 focus:ring-primary font-medium"
        />
        {state?.errors?.name && (
          <p id="name-error" className="text-xs font-bold text-destructive ml-1">
            {state.errors.name[0]}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">
          Email Address
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="alex@university.edu"
          autoComplete="email"
          aria-describedby="email-error"
          disabled={pending}
          className="rounded-2xl h-12 px-4 bg-background border-border/50 focus:ring-2 focus:ring-primary font-medium"
        />
        {state?.errors?.email && (
          <p id="email-error" className="text-xs font-bold text-destructive ml-1">
            {state.errors.email[0]}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          aria-describedby="password-error"
          disabled={pending}
          className="rounded-2xl h-12 px-4 bg-background border-border/50 focus:ring-2 focus:ring-primary font-medium"
        />
        {state?.errors?.password && (
          <p id="password-error" className="text-xs font-bold text-destructive ml-1">
            {state.errors.password[0]}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">
          Confirm Password
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Repeat your password"
          autoComplete="new-password"
          aria-describedby="confirmPassword-error"
          disabled={pending}
          className="rounded-2xl h-12 px-4 bg-background border-border/50 focus:ring-2 focus:ring-primary font-medium"
        />
        {state?.errors?.confirmPassword && (
          <p id="confirmPassword-error" className="text-xs font-bold text-destructive ml-1">
            {state.errors.confirmPassword[0]}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className={cn(
          buttonVariants({ size: "lg" }),
          "w-full rounded-full font-black text-lg h-12 shadow-md hover:shadow-lg transition-all",
          pending && "opacity-60 cursor-not-allowed"
        )}
      >
        {pending ? "Creating account…" : "Create Account"}
      </button>

      <p className="text-center text-sm font-bold text-muted-foreground pt-4 border-t border-border/50">
        Already have an account?{" "}
        <Link href="/login" className="font-black text-primary hover:underline hover:text-primary/80 transition-colors">
          Sign in
        </Link>
      </p>
    </form>
  );
}
