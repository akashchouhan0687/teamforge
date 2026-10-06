import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In — TeamForge",
  description: "Sign in to your TeamForge account.",
};

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <GraduationCap className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-3xl font-black tracking-tight">TeamForge</span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-[2rem] border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl p-8 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40"></div>
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground font-medium mt-2">
              Sign in to continue your journey
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
