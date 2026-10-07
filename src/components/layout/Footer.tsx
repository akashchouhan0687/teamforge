import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background py-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold tracking-tight">TeamForge</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Connecting students through skills, projects, and shared goals.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">Platform</h3>
            <Link href="/discover" className="text-sm text-muted-foreground hover:text-primary">Discover</Link>
            <Link href="/projects" className="text-sm text-muted-foreground hover:text-primary">Projects</Link>
            <Link href="/teams" className="text-sm text-muted-foreground hover:text-primary">Teams</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">Resources</h3>
            <Link href="/help" className="text-sm text-muted-foreground hover:text-primary">Help Center</Link>
            <Link href="/guidelines" className="text-sm text-muted-foreground hover:text-primary">Community Guidelines</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">Legal</h3>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link>
          </div>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between border-t pt-6">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} TeamForge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

