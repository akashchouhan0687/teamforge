import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DiscoveredStudent } from "@/lib/discover";
import { ArrowRight, Sparkles, Award } from "lucide-react";

interface StudentCardProps {
  student: DiscoveredStudent;
}

export function StudentCard({ student }: StudentCardProps) {
  const photoUrl = student.profileImage || student.image;

  const getProficiencyColor = (level?: string | null) => {
    switch (level) {
      case "Advanced":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20";
      case "Intermediate":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20";
      case "Beginner":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const academicInfo = [student.department, student.year]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="group rounded-3xl border bg-card p-6 shadow-sm hover:shadow-lg hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      {/* Decorative gradient blob on hover */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
      
      <div className="space-y-5 relative z-10">
        {/* Top Header: Avatar + Identity */}
        <div className="flex items-start gap-4">
          <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-primary/20 bg-primary/5 shrink-0 flex items-center justify-center shadow-sm">
            {photoUrl ? (
              <SafeImage src={photoUrl} alt={student.name} className="h-full w-full object-cover" width={64} height={64} />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-primary font-black text-xl">
                {student.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 pt-1">
            <Link
              href={`/profile/${student.id}`}
              className="text-xl font-black text-foreground hover:text-primary transition-colors block truncate"
            >
              {student.name}
            </Link>

            {academicInfo ? (
              <p className="text-sm font-medium text-muted-foreground truncate mt-0.5">
                {academicInfo}
              </p>
            ) : (
              <p className="text-sm font-medium text-muted-foreground italic mt-0.5">
                Student
              </p>
            )}
          </div>
        </div>

        {/* Short Bio */}
        {student.bio ? (
          <p className="text-sm font-medium text-muted-foreground line-clamp-2 leading-relaxed">
            {student.bio}
          </p>
        ) : (
          <p className="text-sm font-medium text-muted-foreground/60 italic">
            No bio provided yet.
          </p>
        )}

        {/* Skills Section */}
        <div className="pt-2 space-y-2">
          {student.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {student.skills.slice(0, 4).map((s) => (
                <div
                  key={s.id}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1 text-xs"
                >
                  <span className="font-bold text-foreground">{s.name}</span>
                  {s.proficiency && (
                    <span
                      className={cn(
                        "rounded-[4px] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider border",
                        getProficiencyColor(s.proficiency)
                      )}
                    >
                      {s.proficiency}
                    </span>
                  )}
                </div>
              ))}
              {student.skills.length > 4 && (
                <span className="text-xs font-bold text-muted-foreground self-center px-1">
                  +{student.skills.length - 4} more
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm font-medium text-muted-foreground/60 italic">
              No skills listed
            </p>
          )}
        </div>
      </div>

      {/* Footer / CTA Button */}
      <div className="mt-6 pt-5 border-t border-border/50 flex items-center justify-between relative z-10">
        <div className="text-xs font-bold text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
          {student.projectsCount > 0 ? (
            <span>
              {student.projectsCount}{" "}
              {student.projectsCount === 1 ? "Project" : "Projects"}
            </span>
          ) : (
            <span>Available</span>
          )}
        </div>

        <Link
          href={`/profile/${student.id}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "rounded-full font-bold group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all px-4"
          )}
        >
          View Profile
          <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

