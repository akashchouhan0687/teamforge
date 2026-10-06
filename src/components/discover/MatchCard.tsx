import Link from "next/link";
import { Check, Users, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MatchResult } from "@/lib/matching";

interface MatchCardProps {
  match: MatchResult;
}

function CompatibilityRing({ score }: { score: number }) {
  // Pick color based on score band
  const color =
    score >= 75
      ? "text-emerald-600 dark:text-emerald-400"
      : score >= 50
      ? "text-blue-600 dark:text-blue-400"
      : "text-amber-600 dark:text-amber-400";

  const bg =
    score >= 75
      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
      : score >= 50
      ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
      : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800";

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center justify-center rounded-xl border px-3 py-2 shrink-0",
        bg
      )}
    >
      <span className={cn("text-2xl font-extrabold leading-none tabular-nums", color)}>
        {score}%
      </span>
      <span className="text-[10px] font-semibold text-muted-foreground mt-0.5 uppercase tracking-wide">
        Match
      </span>
    </div>
  );
}

export function MatchCard({ match }: MatchCardProps) {
  const photoUrl = match.targetProfileImage || match.targetImage;
  const initials = match.targetName.charAt(0).toUpperCase();

  // Show up to 4 top complementary skills from the target (unique to them)
  const uniqueTargetSkills = match.targetSkills
    .filter(
      (ts) =>
        !match.commonSkills
          .map((n) => n.toLowerCase())
          .includes(ts.name.toLowerCase())
    )
    .slice(0, 4);

  return (
    <div className="group rounded-3xl border bg-card shadow-sm hover:shadow-lg hover:border-primary/40 hover:-translate-y-1 transition-all flex flex-col overflow-hidden relative">
      {/* Decorative hover gradient */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none" />

      {/* Header */}
      <div className="p-5 flex items-start gap-4 border-b border-border/50 relative z-10">
        {/* Avatar */}
        <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-primary/20 bg-primary/5 flex items-center justify-center shrink-0">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={match.targetName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xl font-black text-primary">{initials}</span>
          )}
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0 pt-0.5">
          <h3 className="font-black text-xl text-foreground truncate leading-tight group-hover:text-primary transition-colors">
            {match.targetName}
          </h3>
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground mt-1">
            {match.targetDepartment && (
              <span className="font-bold text-foreground/80 truncate">
                {match.targetDepartment}
              </span>
            )}
            {match.targetDepartment && match.targetYear && (
              <span className="text-muted-foreground/60">•</span>
            )}
            {match.targetYear && <span className="font-medium">{match.targetYear}</span>}
          </div>
          {/* Potential collaborator label */}
          <span className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md bg-primary/10 text-primary uppercase tracking-wider">
            <Users className="h-3 w-3" />
            Top Match
          </span>
        </div>

        {/* Compatibility badge */}
        <CompatibilityRing score={match.overallScore} />
      </div>

      {/* Body */}
      <div className="p-5 flex-1 space-y-4 relative z-10">
        {/* Why you match */}
        {match.reasons.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Why you match
            </p>
            <ul className="space-y-1.5">
              {match.reasons.slice(0, 3).map((reason, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs font-medium text-foreground/90">
                  <span className="mt-0.5 h-4 w-4 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Their unique skills */}
        {uniqueTargetSkills.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Their skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {uniqueTargetSkills.map((skill) => (
                <Badge
                  key={skill.id}
                  variant="secondary"
                  className="text-[11px] px-2.5 py-0.5 font-bold bg-muted/60"
                >
                  {skill.name}
                </Badge>
              ))}
              {match.targetSkills.length > 4 && (
                <span className="text-[11px] font-bold text-muted-foreground self-center pl-1">
                  +{match.targetSkills.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Shared interests */}
        {match.sharedInterests.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Shared interests
            </p>
            <div className="flex flex-wrap gap-1.5">
              {match.sharedInterests.slice(0, 3).map((interest) => (
                <span
                  key={interest}
                  className="text-[11px] px-2.5 py-0.5 rounded-lg border border-primary/20 bg-primary/5 text-primary font-bold"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="px-5 pb-5 relative z-10">
        <Link
          href={`/profile/${match.targetUserId}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "w-full gap-1.5 text-xs font-bold rounded-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
          )}
        >
          View Profile
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
