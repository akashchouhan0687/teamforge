import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { analyzeTeamSkillGaps } from "@/lib/team-coverage";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, Users, User, LogOut, Trash2, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { scoreTeamCandidate } from "@/lib/team-recommendations";
import { SmartSuggestions } from "./SmartSuggestions";
import { TeamTasks } from "./TeamTasks";

interface TeamDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Team Details — TeamForge",
  description: "View team members and skill coverage.",
};

export default async function TeamDetailPage({
  params,
}: TeamDetailPageProps) {
  const { id } = await params;
  const session = await getSession();

  if (!session?.userId) {
    redirect("/login");
  }

  const team = await db.team.findUnique({
    where: { id },
    include: {
      project: {
        include: {
          skills: {
            include: { skill: true }
          }
        }
      },
      owner: {
        select: {
          id: true,
          name: true,
          profile: true,
          skills: { include: { skill: true } }
        }
      },
      tasks: {
        include: {
          assignedTo: { select: { id: true, name: true, image: true, profile: { select: { profileImage: true } } } },
          createdBy: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' }
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              profile: {
                select: {
                  department: true,
                  year: true,
                  profileImage: true,
                }
              },
              skills: {
                include: { skill: true }
              }
            }
          }
        },
        orderBy: { joinedAt: "asc" }
      }
    }
  });

  if (!team) {
    notFound();
  }

  const isOwner = team.ownerId === session.userId;
  const isMember = team.members.some(m => m.userId === session.userId);

  if (!isMember && !isOwner) {
    // Basic authorization for viewing
    redirect("/teams");
  }

  // Format team members input for gap analysis
  const teamMembersInput = team.members.map(m => ({
    userId: m.userId,
    name: m.user.name,
    skills: m.user.skills.map(s => s.skill)
  }));
  
  const requiredSkills = team.project?.skills.filter(s => s.requirementType === 'REQUIRED').map(s => s.skill) || [];
  const preferredSkills = team.project?.skills.filter(s => s.requirementType === 'PREFERRED').map(s => s.skill) || [];

  const projectRequirements = {
    requiredSkills,
    preferredSkills
  };

  const gapAnalysis = analyzeTeamSkillGaps(projectRequirements, teamMembersInput);

  // -----------------------------------------------------------------------------------------
  // Smart Team Suggestions
  // -----------------------------------------------------------------------------------------
  
  let recommendations: any[] = [];
  
  // Create the owner baseline profile
  const ownerBaselineProfile = {
    id: team.owner.id,
    department: team.owner.profile?.department,
    year: team.owner.profile?.year,
    interests: team.owner.profile?.interests?.split(",") || [],
    availability: team.owner.profile?.bio, // Or availability if it exists
    skills: team.owner.skills.map(s => s.skill)
  };

  if (isOwner && ((gapAnalysis.hasRequirements && gapAnalysis.missingRequiredCount > 0) || gapAnalysis.missingPreferredCount > 0)) {
    const [availableUsers, pendingRequests] = await Promise.all([
      db.user.findMany({
        where: {
          teamMembers: { none: { teamId: team.id } }
        },
        select: {
          id: true,
          name: true,
          image: true,
          profile: {
            select: {
              department: true,
              year: true,
              bio: true,
              location: true,
              profileImage: true,
              interests: true,
            }
          },
          skills: { include: { skill: true } }
        },
        orderBy: { name: 'asc' }
      }),
      db.teamRequest.findMany({
        where: { teamId: team.id, status: 'pending' },
        select: { receiverId: true }
      })
    ]);
    const pendingUserIds = new Set(pendingRequests.map(r => r.receiverId));

    const scoredCandidates = availableUsers
      .filter(u => u.id !== team.owner.id) // Exclude owner
      .map(u => {
        const candidateProfile = {
          id: u.id,
          name: u.name,
          image: u.image,
          profileImage: u.profile?.profileImage || null,
          department: u.profile?.department,
          year: u.profile?.year,
          interests: u.profile?.interests?.split(",") || [],
          availability: u.profile?.bio,
          skills: u.skills.map(s => s.skill),
          teamOwnerProfile: ownerBaselineProfile as any
        };
        
        const scoreResult = scoreTeamCandidate(candidateProfile as any, gapAnalysis);
        if (scoreResult) {
          return {
            ...scoreResult,
            hasPendingInvite: pendingUserIds.has(u.id)
          };
        }
        return null;
      })
      .filter(Boolean) as any[];
      
    // Sort by match score descending
    recommendations = scoredCandidates.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5); // Show top 5
  }

  const isTeamFull = team.project?.teamSize ? team.members.length >= team.project.teamSize : false;

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-5xl space-y-8">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/teams"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-bold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Teams
        </Link>
        <Link 
          href={`/teams/${team.id}/chat`}
          className={cn(buttonVariants({ variant: "default", size: "lg" }), "flex items-center gap-2 rounded-full font-bold shadow-sm")}
        >
          💬 Team Chat
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        
        {/* Main Content (Left Column) */}
        <div className="md:col-span-2 space-y-8">
          <div className="space-y-4 bg-gradient-to-br from-card to-primary/5 p-8 rounded-3xl border border-border/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-primary/10 blur-2xl rounded-full pointer-events-none"></div>
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black text-primary uppercase tracking-widest border border-primary/20">
                Team Workspace
              </div>
              <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
                {team.name}
              </h1>
              <p className="text-muted-foreground font-medium flex items-center gap-2">
                Project: <Link href={`/projects/${team.projectId}`} className="font-bold text-foreground hover:text-primary transition-colors bg-muted/50 px-2 py-0.5 rounded-md">{team.project?.title || "Unknown"}</Link>
              </p>
            </div>
          </div>

          {/* Team Tasks */}
          <TeamTasks 
            teamId={team.id} 
            tasks={team.tasks as any} 
            members={team.members as any} 
            isOwner={isOwner} 
            currentUserId={session.userId} 
          />

          {/* Members List */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-foreground">
                Team Members <span className="text-muted-foreground text-lg ml-1">({team.members.length} {team.project?.teamSize ? `/ ${team.project.teamSize}` : ""})</span>
              </h2>
            </div>
            
            <div className="grid gap-4">
              {team.members.map(member => (
                <div key={member.userId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl border border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-center gap-5">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-background shadow-xs group-hover:border-primary/20 transition-colors">
                      {member.user.profile?.profileImage || member.user.image ? (
                        <SafeImage src={member.user.profile?.profileImage || member.user.image!} alt={member.user.name} className="h-full w-full object-cover" width={48} height={48} />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground font-black text-lg bg-primary/5">
                          {member.user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link href={`/profile/${member.userId}`} className="font-black text-lg text-foreground hover:text-primary transition-colors">
                          {member.user.name}
                        </Link>
                        {member.role === 'OWNER' && (
                          <Badge variant="default" className="text-[10px] px-2 py-0.5 font-black uppercase tracking-widest">Owner</Badge>
                        )}
                      </div>
                      <p className="text-xs font-bold text-muted-foreground mt-0.5">
                        {member.user.profile?.department || "No department specified"} {member.user.profile?.year ? `• ${member.user.profile.year}` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Member & Team Manage for Owner */}
            {isOwner && (
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                {(!team.project?.teamSize || team.members.length < team.project.teamSize) ? (
                  <Link 
                    href={`/teams/${team.id}/members/add`}
                    className={cn(buttonVariants({ variant: "outline", size: "lg" }), "flex-1 border-dashed border-2 rounded-full font-black hover:border-primary/50 hover:bg-primary/5 transition-colors")}
                  >
                    + Add Member
                  </Link>
                ) : (
                  <div className="flex-1 flex items-center justify-center px-4 py-3 border rounded-3xl bg-muted/50 text-sm font-bold text-muted-foreground italic">
                    Team has reached its maximum size of {team.project.teamSize} members.
                  </div>
                )}
                
                <Link 
                  href={`/teams/${team.id}/manage`}
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "flex items-center gap-2 rounded-full font-bold")}
                >
                  <Settings className="h-4 w-4" />
                  Team Manage
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar (Right Column) */}
        <div className="space-y-6">
          {/* Skill Analysis Card */}
          <div className="rounded-3xl border bg-card p-6 shadow-sm space-y-5">
            <div>
              <h3 className="font-black text-xl">Team Skill Analysis</h3>
              <p className="text-sm font-medium text-muted-foreground mt-1">{gapAnalysis.overallStatus}</p>
            </div>
            
            {!gapAnalysis.hasRequirements ? (
              <div className="text-sm font-medium text-muted-foreground italic border-t border-border/50 pt-4">
                Skill requirements haven&apos;t been defined for this project yet.
                {isOwner && (
                  <div className="mt-4">
                    <Link href={`/projects/${team.projectId}/edit`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full rounded-full font-bold")}>
                      Edit Project Requirements
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-5 border-t border-border/50 pt-4">
                {/* Required Skills Progress */}
                {gapAnalysis.requiredSkills.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-foreground">Required Coverage</span>
                      <span className="font-black text-primary">{gapAnalysis.coveragePercentage}%</span>
                    </div>
                    <div className="h-3 w-full bg-muted rounded-full overflow-hidden border border-border/50">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all animate-[scale-x-up_1s_ease-out_forwards] origin-left", 
                          gapAnalysis.coveragePercentage === 100 ? "bg-emerald-500" : "bg-primary"
                        )}
                        style={{ width: `${gapAnalysis.coveragePercentage}%` }} 
                      />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-center">
                      {gapAnalysis.coveredRequiredCount} of {gapAnalysis.requiredSkills.length} required skills covered
                    </p>
                  </div>
                )}

                {/* Missing Skills (Gaps) */}
                {(gapAnalysis.missingRequiredCount > 0 || gapAnalysis.missingPreferredCount > 0) && (
                  <div className="space-y-3 pt-2 border-t border-border/50">
                    <span className="text-[10px] font-black text-foreground uppercase tracking-widest block">Skill Gaps</span>
                    <div className="space-y-2">
                      {gapAnalysis.requiredSkills.filter(s => s.status === 'MISSING').map(gap => (
                        <div key={gap.skill.id} className="flex flex-col p-3 rounded-xl border border-destructive/30 bg-destructive/5 relative overflow-hidden group">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive/50" />
                          <span className="font-bold text-sm text-foreground pl-2">{gap.skill.name}</span>
                          <span className="text-[10px] uppercase font-black tracking-widest text-destructive mt-1 pl-2">Required • High Priority</span>
                        </div>
                      ))}
                      {gapAnalysis.preferredSkills.filter(s => s.status === 'MISSING').map(gap => (
                        <div key={gap.skill.id} className="flex flex-col p-3 rounded-xl border bg-muted/40 relative overflow-hidden">
                          <span className="font-bold text-sm text-foreground">{gap.skill.name}</span>
                          <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mt-1">Preferred • Medium Priority</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Covered Skills */}
                {(gapAnalysis.coveredRequiredCount > 0 || gapAnalysis.coveredPreferredCount > 0) && (
                  <div className="space-y-3 pt-2 border-t border-border/50">
                    <span className="text-[10px] font-black text-foreground uppercase tracking-widest block">Covered Skills</span>
                    
                    <div className="space-y-2">
                      {gapAnalysis.requiredSkills.filter(s => s.status === 'COVERED').map(covered => (
                        <div key={covered.skill.id} className="flex flex-col p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/50" />
                          <div className="flex items-center justify-between pl-2">
                            <span className="font-bold text-sm text-foreground flex items-center gap-2">
                              {covered.skill.name}
                            </span>
                            <span className="text-[9px] uppercase font-black tracking-widest text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">Required</span>
                          </div>
                          <div className="text-[11px] font-medium text-muted-foreground mt-1.5 pl-2">
                            <span className="font-bold">Provided by:</span> {covered.providedBy.map(p => p.name).join(", ")}
                          </div>
                        </div>
                      ))}
                      
                      {gapAnalysis.preferredSkills.filter(s => s.status === 'COVERED').map(covered => (
                        <div key={covered.skill.id} className="flex flex-col p-3 rounded-xl border bg-muted/40 relative overflow-hidden">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-foreground flex items-center gap-2">
                              {covered.skill.name}
                            </span>
                            <span className="text-[9px] uppercase font-black tracking-widest text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">Preferred</span>
                          </div>
                          <div className="text-[11px] font-medium text-muted-foreground mt-1.5">
                            <span className="font-bold">Provided by:</span> {covered.providedBy.map(p => p.name).join(", ")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {gapAnalysis.hasRequirements && gapAnalysis.missingRequiredCount === 0 && (
                  <div className="p-4 bg-emerald-500/10 text-emerald-600 text-sm font-black rounded-2xl text-center border border-emerald-500/20">
                    All required skills are covered! 🎉
                  </div>
                )}
              </div>
            )}
          </div>
          
          <SmartSuggestions 
            teamId={team.id}
            recommendations={recommendations}
            isOwner={isOwner}
            isTeamFull={isTeamFull}
            hasRequirements={gapAnalysis.hasRequirements}
            hasGaps={gapAnalysis.missingRequiredCount > 0 || gapAnalysis.missingPreferredCount > 0}
          />
        </div>
      </div>
    </div>
  );
}




