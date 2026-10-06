import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Bell, Users, Menu, Sparkles } from "lucide-react";
import { getSession } from "@/lib/session";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { NavLinks } from "./NavLinks";
import { MobileMenu } from "./MobileMenu";

export async function Navbar() {
  const session = await getSession();
  const isAuthenticated = !!session?.userId;
  
  let unreadCount = 0;
  let userProfile = null;
  
  if (isAuthenticated) {
    unreadCount = await db.notification.count({
      where: { userId: session.userId, read: false }
    });
    const user = await db.user.findUnique({
      where: { id: session.userId },
      include: { profile: true }
    });
    userProfile = user;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="Go to TeamForge home">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20 transition-transform group-hover:scale-105">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
                <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              TeamForge
            </span>
          </Link>

          {/* Navigation Links */}
          <NavLinks isAuthenticated={isAuthenticated} />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          {isAuthenticated ? (
            <>
              <Link
                href="/notifications"
                className="relative p-2.5 text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-105 rounded-full hover:bg-primary/5"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1.5 h-4 w-4 bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center rounded-full ring-2 ring-background">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              
              <div className="h-5 w-px bg-border hidden sm:block mx-1"></div>

              <Link
                href="/profile"
                className="hidden sm:flex items-center gap-2 p-1 pl-2 pr-1 rounded-full border bg-card hover:border-primary/30 transition-all hover:shadow-sm"
              >
                <span className="text-sm font-semibold pl-1 text-foreground">
                  {userProfile?.name?.split(' ')[0]}
                </span>
                <div className="h-7 w-7 rounded-full bg-muted border overflow-hidden shrink-0">
                  {userProfile?.profile?.profileImage || userProfile?.image ? (
                    <img src={userProfile?.profile?.profileImage || userProfile?.image!} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      {userProfile?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </Link>

              <form action={logout} className="hidden sm:block ml-1">
                <button
                  type="submit"
                  className="text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors px-2"
                >
                  Sign Out
                </button>
              </form>
              
              {/* Mobile Menu */}
              <MobileMenu isAuthenticated={isAuthenticated} />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden md:block text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign In
              </Link>
              <Link href="/register" className={cn(buttonVariants({ variant: "default" }), "rounded-full px-6 font-semibold shadow-sm")}>
                Get Started
              </Link>
              <MobileMenu isAuthenticated={isAuthenticated} />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
