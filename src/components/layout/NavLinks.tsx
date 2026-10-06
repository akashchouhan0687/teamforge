"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavLinks({ isAuthenticated }: { isAuthenticated: boolean }) {
  const pathname = usePathname();

  const authenticatedLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/discover", label: "Discover" },
    { href: "/projects", label: "Projects" },
    { href: "/teams", label: "Teams" },
  ];

  const publicLinks = [
    { href: "/discover", label: "Discover" },
    { href: "/projects", label: "Projects" },
    { href: "/teams", label: "Teams" },
  ];

  const links = isAuthenticated ? authenticatedLinks : publicLinks;

  return (
    <nav className="hidden md:flex items-center gap-1">
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative px-3 py-2 text-sm font-semibold rounded-full transition-all duration-200 ease-in-out",
              isActive 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
