"use client";

import { useState, useTransition } from "react";
import { addTeamMember } from "@/app/actions/teams";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { CandidateRecommendation } from "@/lib/team-recommendations";

interface SmartSuggestionsProps {
  teamId: string;
  recommendations: CandidateRecommendation[];
  isOwner: boolean;
  isTeamFull: boolean;
  hasRequirements: boolean;
  hasGaps: boolean;
}

export function SmartSuggestions({ teamId, recommendations, isOwner, isTeamFull, hasRequirements, hasGaps }: SmartSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");

  const handleInvite = (userId: string) => {
    if (isTeamFull) return;
    setInvitingId(userId);
    startTransition(async () => {
      try {
        const { sendTeamInvitation } = await import("@/app/actions/invitations");
        await sendTeamInvitation(teamId, userId);
        alert("Invitation sent successfully!");
      } catch (err: any) {
        alert(err.message || "Failed to send invitation");
      } finally {
        setInvitingId(null);
      }
    });
  };

  const filteredRecommendations = recommendations.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.gapSkillsFilled.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // The Entry Card
  const EntryCard = () => {
    if (!hasRequirements) {
      return (
        <div className="rounded-3xl border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-black text-xl border-b border-border/50 pb-3 flex items-center gap-2">
            🤝 Smart Team Suggestions
          </h3>
          <p className="text-sm font-medium text-muted-foreground italic">
            Add required skills to your project to find students who can fill your team&apos;s skill gaps.
          </p>
        </div>
      );
    }

    if (!hasGaps) {
      return (
        <div className="rounded-3xl border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-black text-xl border-b border-border/50 pb-3 flex items-center gap-2">
            🤝 Smart Team Suggestions
          </h3>
          <p className="text-sm text-emerald-600 font-bold italic">
            Your team is complete. All required project skills are currently covered.
          </p>
        </div>
      );
    }

    if (recommendations.length === 0) {
      return (
        <div className="rounded-3xl border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-black text-xl border-b border-border/50 pb-3 flex items-center gap-2">
            🤝 Smart Team Suggestions
          </h3>
          <p className="text-sm font-medium text-muted-foreground italic">
            No matching students found. None of the current student profiles have the missing skills.
          </p>
        </div>
      );
    }

    // Determine missing skills from recommendations
    const missingSkillsSet = new Set<string>();
    recommendations.forEach(r => r.gapSkillsFilled.forEach(s => missingSkillsSet.add(s)));
    const missingSkillsList = Array.from(missingSkillsSet);

    return (
      <div className="rounded-3xl border bg-card p-6 shadow-sm space-y-5">
        <div>
          <h3 className="font-black text-xl flex items-center gap-2">
            🤝 Smart Team Suggestions
          </h3>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Find students who can fill your team&apos;s missing skill gaps.
          </p>
        </div>
        
        {missingSkillsList.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Missing:</span>
            <div className="flex flex-wrap gap-2">
              {missingSkillsList.map(s => (
                <Badge key={s} variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20 text-xs px-2.5 py-1 font-bold">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="pt-2">
          <button
            onClick={() => setIsOpen(true)}
            className={cn(buttonVariants({ variant: "default", size: "lg" }), "w-full rounded-full font-bold")}
          >
            Find Matching Students
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <EntryCard />
      
      {/* Modal / Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
          <div className="bg-card w-full max-w-4xl border border-border/50 rounded-3xl shadow-2xl flex flex-col max-h-full relative overflow-hidden">
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-border/50 flex items-start sm:items-center justify-between sticky top-0 bg-card/95 backdrop-blur z-20">
              <div>
                <h3 className="font-black text-3xl tracking-tight flex flex-wrap items-center gap-3">
                  Smart Suggestions
                  <Badge variant="secondary" className="font-bold bg-primary/10 text-primary border-primary/20 text-sm">{recommendations.length} found</Badge>
                </h3>
                <p className="text-base font-medium text-muted-foreground mt-2">Students who can fill your team&apos;s skill gaps.</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-3 rounded-full hover:bg-muted/80 transition-colors text-muted-foreground bg-muted/40 absolute top-6 right-6"
              >
                ✕
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-8 relative z-10">
              
              {/* Filter */}
              <div>
                <input 
                  type="text" 
                  placeholder="Search students by name or skill..." 
                  className="w-full sm:max-w-md px-5 py-3 border border-border/60 rounded-full text-sm font-medium bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {filteredRecommendations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground font-bold">
                  No students found matching your search.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredRecommendations.map(student => (
                    <div key={student.userId} className="flex flex-col p-6 rounded-3xl border border-border/60 bg-background shadow-sm hover:shadow-lg transition-shadow group relative overflow-hidden">
                      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
                      
                      {/* Top section: Avatar + Info + Score */}
                      <div className="flex items-start gap-5 relative z-10">
                        <div className="h-16 w-16 md:h-20 md:w-20 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0 border-2 border-background shadow-sm">
                          {student.profileImage || student.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={student.profileImage || student.image!} alt={student.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-primary/5 text-muted-foreground font-black text-2xl">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex items-start justify-between">
                          <div>
                            <h4 className="font-black text-xl text-foreground truncate group-hover:text-primary transition-colors">{student.name}</h4>
                            <p className="text-xs font-bold text-muted-foreground truncate mt-1">
                              {student.department || "No Department"} {student.year ? `• ${student.year}` : ""}
                            </p>
                          </div>
                          <div className="text-right shrink-0 pl-2 mt-1">
                            <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-black whitespace-nowrap shadow-sm border border-emerald-500/20">
                              {student.matchScore}% Fit
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex-1 space-y-6 relative z-10">
                        {/* Best For */}
                        {student.gapSkillsFilled.length > 0 && (
                          <div>
                            <span className="text-[10px] font-black text-foreground uppercase tracking-widest block">Best match for</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {student.gapSkillsFilled.map(s => (
                                <Badge key={s} variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-2.5 py-1 font-bold">
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Skills */}
                        <div>
                          <span className="text-[10px] font-black text-foreground uppercase tracking-widest block">Skills</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {student.skills.slice(0, 5).map(s => (
                              <Badge key={s.id} variant="outline" className="px-2.5 py-1 text-muted-foreground font-bold bg-background">
                                {s.name}
                              </Badge>
                            ))}
                            {student.skills.length > 5 && (
                              <span className="text-xs font-bold text-muted-foreground ml-1 self-center">+{student.skills.length - 5}</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Why recommended (No nested box, simple list) */}
                        <div>
                          <ul className="space-y-2">
                            {student.reasons.slice(0, 3).map((r, i) => (
                              <li key={i} className="text-sm font-medium text-muted-foreground flex items-start gap-2.5">
                                <span className={cn("shrink-0 mt-0.5", r.startsWith('✓') ? "text-emerald-500 font-bold" : "")}>
                                  {r.startsWith('✓') ? '✓' : '•'}
                                </span>
                                <span className="leading-snug">{r.replace('✓ ', '')}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="mt-8 pt-6 border-t border-border/50 flex flex-wrap items-center gap-3 relative z-10">
                        <Link 
                          href={`/profile/${student.userId}`} 
                          target="_blank"
                          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "flex-1 rounded-full font-bold")}
                        >
                          View Profile
                        </Link>
                        
                        {isOwner && (
                          <button
                            onClick={() => student.hasPendingInvite ? null : handleInvite(student.userId)}
                            disabled={isPending || isTeamFull || student.hasPendingInvite}
                            className={cn(buttonVariants({ variant: student.hasPendingInvite ? "secondary" : "default", size: "lg" }), "flex-1 rounded-full font-bold shadow-sm")}
                          >
                            {invitingId === student.userId ? (
                              <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Sending...</>
                            ) : student.hasPendingInvite ? (
                              "Invite Sent"
                            ) : isTeamFull ? (
                              "Team Full"
                            ) : (
                              "Invite to Team"
                            )}
                          </button>
                        )}
                      </div>
                      
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
