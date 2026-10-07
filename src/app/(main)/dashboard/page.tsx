import { redirect } from "next/navigation";
import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { calculateProfileCompletion } from "@/lib/profile";
import { matchProfiles } from "@/lib/matching";
import { analyzeTeamSkillGaps } from "@/lib/team-coverage";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Briefcase, Users, Bell, ArrowRight, FolderGit2, Plus, Zap, Check, AlertCircle, Compass, ShieldAlert, Clock, CheckCircle2
} from "lucide-react";

export const metadata = {
  title: "Dashboard — TeamForge",
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const [
    user,
    pendingConnectionRequests,
    recentConnections,
    pendingTeamInvitations,
    recentNotifications,
    activeTeams,
    candidateUsers,
    rawMyTasks
  ] = await Promise.all([    db.user.findUnique({
      where: { id: session.userId },
      include: {
        profile: true,
        skills: {
          include: { skill: true },
          orderBy: { skill: { name: "asc" } },
        },
        projects: {
          orderBy: { createdAt: "desc" },
          include: { 
            skills: { include: { skill: true } },
            team: { select: { id: true, members: { select: { userId: true } } } }
          }
        },
      },
    }),
    db.connection.findMany({
      where: { receiverId: session.userId, status: 'pending' },
      include: { sender: { select: { name: true, profile: true, image: true } } },
      take: 3,
      orderBy: { createdAt: 'desc' }
    }),
    db.connection.findMany({
      where: { 
        status: 'accepted',
        OR: [ { senderId: session.userId }, { receiverId: session.userId } ]
      },
      include: {
        sender: { include: { profile: true } },
        receiver: { include: { profile: true } }
      },
      take: 3,
      orderBy: { createdAt: 'desc' }
    }),
    db.teamRequest.findMany({
      where: { receiverId: session.userId, status: 'pending' },
      include: { 
        team: { select: { name: true, project: { select: { title: true } } } },
        sender: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    db.notification.findMany({
      where: { userId: session.userId },
      take: 4,
      orderBy: { createdAt: 'desc' }
    }),
    db.team.findMany({
      where: {
        OR: [
          { ownerId: session.userId },
          { members: { some: { userId: session.userId } } }
        ]
      },
      include: {
        project: { include: { skills: { include: { skill: true } } } },
        members: { 
          include: {
            user: { include: { profile: true, skills: { include: { skill: true } } } }
          }
        }
      },
      take: 4,
      orderBy: { createdAt: 'desc' }
    }),
    db.user.findMany({
      where: { id: { not: session.userId } },
      select: {
        id: true,
        name: true,
        image: true,
        profile: {
          select: {
            department: true,
            year: true,
            interests: true,
            availability: true,
            profileImage: true,
          }
        },
        skills: {
          select: {
            proficiency: true,
            skill: { select: { id: true, name: true } }
          }
        }
      },
      take: 20
    }),
    db.task.findMany({
      where: {
        assignedToId: session.userId,
        team: {
          members: { some: { userId: session.userId } }
        }
      },
      include: {
        team: { select: { id: true, name: true, project: { select: { title: true } } } }
      },
      orderBy: { updatedAt: 'desc' }
    })
  ]);

  if (!user) redirect("/login");
  const completion = calculateProfileCompletion(user);

  const viewerProfile = {
    id: user.id,
    department: user.profile?.department ?? null,
    year: user.profile?.year ?? null,
    interests: (user.profile?.interests ?? "").split(",").map(i => i.trim()).filter(Boolean),
    availability: user.profile?.availability ?? null,
    skills: user.skills.map(us => ({
      id: us.skill.id,
      name: us.skill.name,
      proficiency: us.proficiency,
    })),
  };

  const recommendations = candidateUsers
    .map(candidate => {
      const candidateProfile = {
        id: candidate.id,
        department: candidate.profile?.department ?? null,
        year: candidate.profile?.year ?? null,
        interests: (candidate.profile?.interests ?? "").split(",").map(i => i.trim()).filter(Boolean),
        availability: candidate.profile?.availability ?? null,
        skills: candidate.skills.map(us => ({
          id: us.skill.id,
          name: us.skill.name,
          proficiency: us.proficiency,
        })),
      };
      
      const match = matchProfiles(viewerProfile, candidateProfile, {
        name: candidate.name,
        image: candidate.image,
        profileImage: candidate.profile?.profileImage ?? null
      });

      return {
        ...candidate,
        matchScore: match.overallScore,
        reasons: match.reasons
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);

  // Calculate team skill gaps for the first team that has gaps
  let skillGapTeam = null;
  let skillGapAnalysis = null;
  
  for (const team of activeTeams) {
    if (team.project?.skills && team.project.skills.length > 0) {
      const requiredSkills = team.project.skills.filter(s => s.requirementType === 'REQUIRED').map(s => s.skill);
      const preferredSkills = team.project.skills.filter(s => s.requirementType === 'PREFERRED').map(s => s.skill);
      const members = team.members.map(m => ({
        userId: m.user.id,
        name: m.user.name,
        skills: m.user.skills.map(us => us.skill)
      }));
      
      const analysis = analyzeTeamSkillGaps({ requiredSkills, preferredSkills }, members);
      if (analysis.hasRequirements && analysis.missingRequiredCount > 0) {
        skillGapTeam = team;
        skillGapAnalysis = analysis;
        break; // Show only the most pressing one
      }
    }
  }

  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";

  const sortedMyTasks = rawMyTasks.sort((a: any, b: any) => {
    const rankA = a.status === 'TODO' ? 1 : a.status === 'IN_PROGRESS' ? 2 : 3;
    const rankB = b.status === 'TODO' ? 1 : b.status === 'IN_PROGRESS' ? 2 : 3;
    if (rankA !== rankB) return rankA - rankB;
    if (a.dueDate && b.dueDate) return a.dueDate.getTime() - b.dueDate.getTime();
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  }).slice(0, 5);
  const firstName = user.name ? user.name.split(" ")[0] : "Welcome back";

  return (
    <div className="min-h-screen pb-20 pt-6 md:pt-10">
      <main className="container mx-auto px-4 md:px-6 max-w-6xl space-y-12">
        
        {/* 1. HEADER */}
        <div className="space-y-1 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-muted-foreground font-medium text-base md:text-lg">
            Build better teams. Find people who complement your skills.
          </p>
        </div>

        {/* 2. TOP ROW (Profile + Invites) */}
        <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {/* PROFILE COMPLETION */}
          <div className="rounded-3xl border bg-card p-6 shadow-sm flex flex-col animate-hover-subtle">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg">Profile</h3>
              <span className="font-black text-primary">{completion.percentage}% complete</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full mb-6 overflow-hidden">
               <div className="h-full bg-primary animate-[scale-x-up_1s_ease-out_forwards] origin-left rounded-full" style={{ width: `${completion.percentage}%` }} />
            </div>
            {completion.missingFields.length > 0 ? (
              <div className="space-y-2 mb-6 flex-1">
                {completion.missingFields.slice(0, 3).map(field => (
                  <div key={field} className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                    Add your {field.toLowerCase()}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center gap-2 text-emerald-600 dark:text-emerald-500 font-bold mb-6">
                <Check className="h-5 w-5" /> Profile complete ✓
              </div>
            )}
            <Link href="/profile/edit" className={cn(buttonVariants({ variant: "outline", size: "default" }), "w-full rounded-full font-bold")}>
              {completion.missingFields.length > 0 ? "Complete Profile →" : "Edit Profile"}
            </Link>
          </div>

          {/* INVITATIONS & ACTION REQUIRED */}
          {pendingTeamInvitations.length > 0 ? (
            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 shadow-sm flex flex-col group hover:border-primary/40 transition-colors">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" /> Team Invitations
              </h3>
              {pendingTeamInvitations.length === 1 ? (
                <div className="flex-1">
                   <p className="text-sm font-medium text-muted-foreground">
                     <span className="font-bold text-foreground">{pendingTeamInvitations[0].sender.name}</span> invited you to join:
                   </p>
                   <p className="font-black text-xl text-primary mt-2 line-clamp-2">{pendingTeamInvitations[0].team.name}</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-center">
                   <p className="text-base font-bold">You have <span className="text-primary text-2xl mx-1">{pendingTeamInvitations.length}</span> pending invitations.</p>
                </div>
              )}
              <Link href="/teams" className={cn(buttonVariants({ variant: "default", size: "default" }), "w-full rounded-full font-bold mt-6 shadow-sm group-hover:bg-primary/90")}>
                View Invitation{pendingTeamInvitations.length !== 1 && 's'}
              </Link>
            </div>
          ) : pendingConnectionRequests.length > 0 ? (
            <div className="rounded-3xl border border-blue-500/20 bg-blue-500/5 p-6 shadow-sm flex flex-col group hover:border-blue-500/40 transition-colors">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" /> Connection Requests
              </h3>
              <div className="flex-1 flex flex-col justify-center">
                 <p className="text-base font-bold">You have <span className="text-blue-500 text-2xl mx-1">{pendingConnectionRequests.length}</span> pending connection request{pendingConnectionRequests.length !== 1 && 's'}.</p>
              </div>
              <Link href="/connections" className={cn(buttonVariants({ variant: "default", size: "default" }), "w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full font-bold mt-6 shadow-sm")}>
                View Connections
              </Link>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed bg-card/50 p-6 flex flex-col items-center justify-center text-center space-y-3">
               <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                 <Check className="h-6 w-6" />
               </div>
               <div>
                 <p className="font-bold text-foreground">You're all caught up</p>
                 <p className="text-sm font-medium text-muted-foreground mt-1">No pending invitations or requests.</p>
               </div>
            </div>
          )}
        </div>

        {/* 3. RECOMMENDED STUDENTS */}
        <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div>
            <h2 className="text-2xl font-black flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" /> Recommended Students
            </h2>
            <p className="text-muted-foreground font-medium text-sm mt-1 ml-8">People whose skills complement yours.</p>
          </div>
          
          {recommendations.length === 0 ? (
            <div className="rounded-3xl border bg-card p-10 text-center flex flex-col items-center justify-center space-y-4">
              <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">Complete your profile to unlock better matches.</p>
                <p className="text-muted-foreground font-medium mt-1">Add your skills, interests, and major to find teammates.</p>
              </div>
              <Link href="/profile/edit" className={cn(buttonVariants({ variant: "default" }), "mt-2 rounded-full font-bold px-6")}>
                Complete Profile →
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {recommendations.map(rec => (
                <div key={rec.id} className="rounded-3xl border bg-card p-6 shadow-sm animate-hover-lift hover:border-primary/30 flex flex-col h-full group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-muted border overflow-hidden shrink-0">
                        {rec.profile?.profileImage || rec.image ? (
                          <SafeImage src={rec.profile?.profileImage || rec.image!} alt={rec.name} className="h-full w-full object-cover" width={48} height={48} />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-primary font-bold text-lg bg-primary/10">
                            {rec.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-black text-foreground group-hover:text-primary transition-colors line-clamp-1">{rec.name}</h3>
                        <p className="text-xs font-medium text-muted-foreground line-clamp-1">
                          {rec.profile?.department || "No Dept"} {rec.profile?.year ? `• ${rec.profile.year.split(' ')[0]}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="bg-primary/10 text-primary px-2.5 py-1 rounded-md text-xs font-black shrink-0 border border-primary/20">
                      {rec.matchScore}%
                    </div>
                  </div>
                  
                  <div className="mt-2 space-y-4 flex-1 flex flex-col">
                    <div className="flex flex-wrap gap-1.5">
                      {rec.skills.slice(0,3).map(s => (
                        <span key={s.skill.id} className="text-[10px] font-bold px-2 py-1 rounded-md bg-muted text-muted-foreground">
                          {s.skill.name}
                        </span>
                      ))}
                      {rec.skills.length > 3 && (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-muted text-muted-foreground">
                          +{rec.skills.length - 3}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground font-medium line-clamp-2 mt-auto">
                      {rec.reasons[0] || "You complement each other's skills."}
                    </p>
                  </div>
                  
                  <Link href={`/profile/${rec.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full mt-5 rounded-full font-bold group-hover:bg-primary/5")}>
                    View Profile
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          {/* 4. PROJECT OVERVIEW */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black flex items-center gap-2">
                <FolderGit2 className="h-5 w-5 text-blue-500" /> Your Projects
              </h2>
              <Link href="/projects" className="text-sm font-bold text-muted-foreground hover:text-blue-500 transition-colors">
                View All →
              </Link>
            </div>
            
            {user.projects.length === 0 ? (
              <div className="rounded-3xl border bg-card p-8 text-center flex flex-col items-center border-dashed">
                <div className="h-12 w-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
                  <Briefcase className="h-6 w-6" />
                </div>
                <p className="font-bold text-foreground">Start building something.</p>
                <Link href="/projects/new" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 rounded-full font-bold")}>
                  Create Project
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {user.projects.slice(0, 3).map(project => (
                  <div key={project.id} className="rounded-2xl border bg-card p-5 animate-hover-subtle hover:border-blue-500/30 flex flex-col gap-3 group shadow-sm">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-bold text-foreground group-hover:text-blue-500 transition-colors line-clamp-1">{project.title}</h3>
                        <p className="text-sm text-muted-foreground font-medium line-clamp-1 mt-1">{project.description || "No description provided."}</p>
                      </div>
                      {project.projectType && (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-muted px-2 py-1 rounded text-muted-foreground shrink-0 border">
                          {project.projectType.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    
                    {project.skills && project.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {project.skills.slice(0,3).map(s => (
                          <span key={s.skill.id} className="text-[10px] font-bold px-2 py-1 rounded-md bg-muted text-muted-foreground border">
                            {s.skill.name}
                          </span>
                        ))}
                        {project.skills.length > 3 && (
                          <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-muted text-muted-foreground border">
                            +{project.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-2 pt-3 border-t">
                      <span className="text-xs font-bold text-muted-foreground">
                        {project.team ? (
                          `Team: ${project.team.members.length}${project.teamSize ? ` / ${project.teamSize}` : ""}`
                        ) : project.teamSize ? (
                          `Team size: ${project.teamSize}`
                        ) : (
                          "No team yet"
                        )}
                      </span>
                      <Link href={`/projects/${project.id}`} className="text-xs font-bold text-blue-500 hover:underline">
                        View Project
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. TEAM OVERVIEW */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" /> Your Teams
              </h2>
              <Link href="/teams" className="text-sm font-bold text-muted-foreground hover:text-purple-500 transition-colors">
                View All →
              </Link>
            </div>
            
            {activeTeams.length === 0 ? (
              <div className="rounded-3xl border bg-card p-8 text-center flex flex-col items-center border-dashed">
                <div className="h-12 w-12 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3">
                  <Users className="h-6 w-6" />
                </div>
                <p className="font-bold text-foreground">Your next project could use a team.</p>
                <Link href="/discover" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 rounded-full font-bold")}>
                  Explore Students
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeTeams.map(team => {
                  let coverage = 0;
                  if (team.project?.skills) {
                    const req = team.project.skills.filter(s => s.requirementType === 'REQUIRED').map(s => s.skill);
                    const mems = team.members.map(m => ({
                      userId: m.user.id,
                      name: m.user.name,
                      skills: m.user.skills.map(us => us.skill)
                    }));
                    coverage = analyzeTeamSkillGaps({ requiredSkills: req, preferredSkills: [] }, mems).coveragePercentage;
                  }

                  return (
                    <div key={team.id} className="rounded-2xl border bg-card p-5 animate-hover-subtle hover:border-purple-500/30 flex flex-col gap-3 group shadow-sm">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="font-bold text-foreground group-hover:text-purple-500 transition-colors line-clamp-1">{team.name}</h3>
                          <p className="text-sm text-muted-foreground font-medium line-clamp-1 mt-1">{team.project?.title || "No Project Attached"}</p>
                        </div>
                        {team.project?.skills && (
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded shrink-0 border",
                            coverage === 100 
                              ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" 
                              : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                          )}>
                            {coverage}% Covered
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {team.members.slice(0,3).map(m => (
                              <div key={m.user.id} className="h-6 w-6 rounded-full border-2 border-card bg-muted overflow-hidden">
                                {m.user.profile?.profileImage || m.user.image ? (
                                  <SafeImage src={m.user.profile?.profileImage || m.user.image!} alt="" className="h-full w-full object-cover" width={24} height={24} />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-[8px] font-bold bg-primary/10 text-primary">
                                    {m.user.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <span className="text-xs font-bold text-muted-foreground ml-1">
                            {team.members.length} {team.project?.teamSize ? `/ ${team.project.teamSize}` : ""} members
                          </span>
                        </div>
                        <Link href={`/teams/${team.id}`} className="text-xs font-bold text-purple-500 hover:underline">
                          Open Team
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* MY TASKS */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" /> My Tasks
              </h2>
              {rawMyTasks.length > 5 && (
                <Link href={`/teams/${sortedMyTasks[0].team.id}#tasks`} className="text-sm font-bold text-muted-foreground hover:text-emerald-500 transition-colors">
                  View All ?
                </Link>
              )}
            </div>
            
            {sortedMyTasks.length === 0 ? (
              <div className="rounded-3xl border bg-card p-8 text-center flex flex-col items-center border-dashed h-[220px] justify-center">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <p className="font-bold text-foreground">You're all caught up.</p>
                <p className="text-sm font-medium text-muted-foreground mt-1">No tasks are currently assigned to you.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedMyTasks.map((task: any) => {
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "COMPLETED";
                  
                  return (
                    <Link 
                      href={`/teams/${task.teamId}#tasks`}
                      key={task.id} 
                      className="block rounded-2xl border bg-card p-5 animate-hover-subtle hover:border-emerald-500/30 shadow-sm"
                    >
                      <div className="flex flex-col gap-2">
                        <h3 className="font-bold text-foreground line-clamp-1">{task.title}</h3>
                        <p className="text-xs font-bold text-muted-foreground line-clamp-1">
                          {task.team.name}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-2 mt-2 pt-3 border-t">
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border",
                            task.status === "COMPLETED" ? "text-emerald-700 bg-emerald-100 border-emerald-200" :
                            task.status === "IN_PROGRESS" ? "text-primary bg-primary/10 border-primary/20" :
                            "text-muted-foreground bg-muted border-border/50"
                          )}>
                            {task.status === "COMPLETED" ? "Completed" : task.status === "IN_PROGRESS" ? "In Progress" : "To Do"}
                          </span>
                          
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border",
                            task.priority === "HIGH" ? "text-red-600 bg-red-100 border-red-200" :
                            task.priority === "MEDIUM" ? "text-amber-600 bg-amber-100 border-amber-200" :
                            "text-emerald-600 bg-emerald-100 border-emerald-200"
                          )}>
                            {task.priority}
                          </span>

                          {task.dueDate ? (
                            <span className={cn(
                              "text-xs font-bold flex items-center gap-1 ml-auto",
                              isOverdue ? "text-red-600" : "text-muted-foreground"
                            )}>
                              <Clock className="h-3 w-3" />
                              {isOverdue ? "Overdue" : "Due " + new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          ) : (
                            <span className="text-xs font-bold flex items-center gap-1 ml-auto text-muted-foreground opacity-60">
                              No due date
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM ROW: SKILL GAPS | CONNECTIONS / NOTIFICATIONS | QUICK ACTIONS */}
        <div className="grid lg:grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          
          {/* 6. TEAM SKILL GAPS */}
          <div className="space-y-6 flex flex-col">
            <h2 className="text-xl font-black">Team Needs</h2>
            <div className="flex-1">
              {skillGapTeam && skillGapAnalysis && skillGapAnalysis.missingRequiredCount > 0 ? (
                <div className="rounded-3xl border bg-card p-6 shadow-sm border-amber-500/30 h-full flex flex-col">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 mb-3">
                    <ShieldAlert className="h-5 w-5" />
                    <span className="font-bold text-sm">Skill Gap Detected</span>
                  </div>
                  <p className="font-black text-foreground mb-1 line-clamp-1">{skillGapTeam.name}</p>
                  <p className="text-sm font-medium text-muted-foreground mb-4">
                    {skillGapAnalysis.coveragePercentage}% skill coverage
                  </p>
                  <div className="space-y-2 mb-6 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Missing required skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {skillGapAnalysis.requiredSkills.filter(s => s.status === 'MISSING').map(s => s.skill).slice(0,4).map(skill => (
                        <span key={skill.id} className="text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20 px-2 py-1 rounded">
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Link href={`/teams/${skillGapTeam.id}/members/add`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full rounded-full font-bold")}>
                    Find People →
                  </Link>
                </div>
              ) : activeTeams.length > 0 ? (
                <div className="rounded-3xl border bg-card p-6 shadow-sm flex items-center gap-4 h-full">
                  <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center shrink-0">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Team skills covered ✓</p>
                    <p className="text-sm font-medium text-muted-foreground mt-0.5">No missing required skills.</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border bg-card p-6 shadow-sm border-dashed h-full flex flex-col justify-center items-center">
                  <p className="font-bold text-sm text-muted-foreground">Join a team to see skill gaps.</p>
                </div>
              )}
            </div>
          </div>

          {/* 7. CONNECTIONS & 9. NOTIFICATIONS (Combined Activity Feed) */}
          <div className="space-y-6 flex flex-col">
            <h2 className="text-xl font-black">Recent Activity</h2>
            <div className="rounded-3xl border bg-card p-1 shadow-sm flex flex-col flex-1 min-h-[220px]">
              <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
                {recentConnections.length === 0 && recentNotifications.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-4">
                    <Clock className="h-6 w-6 mb-2 opacity-50" />
                    <p className="font-bold text-sm">No recent activity.</p>
                  </div>
                ) : (
                  <>
                    {recentConnections.map(conn => {
                      const otherUser = conn.senderId === user.id ? conn.receiver : conn.sender;
                      return (
                        <div key={conn.id} className="flex gap-3 items-start">
                          <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                            <Check className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              Recently connected with <span className="font-bold">{otherUser.name}</span>
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {recentNotifications.map(notif => (
                      <div key={notif.id} className="flex gap-3 items-start">
                        <div className="h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                          <Bell className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {notif.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
              <div className="p-3 border-t bg-muted/20 rounded-b-[22px]">
                <div className="flex gap-2">
                  <Link href="/connections" className="text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted py-2 px-3 rounded-lg flex-1 text-center transition-colors">
                    Connections
                  </Link>
                  <Link href="/notifications" className="text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted py-2 px-3 rounded-lg flex-1 text-center transition-colors">
                    Notifications
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 10. QUICK ACTIONS */}
          <div className="space-y-6 flex flex-col">
            <h2 className="text-xl font-black">Quick Actions</h2>
            <div className="rounded-3xl border bg-card p-6 shadow-sm flex flex-col gap-3 justify-center flex-1 min-h-[220px]">
              <Link href="/projects/new" className={cn(buttonVariants({ variant: "default" }), "w-full rounded-full font-bold justify-start px-6 h-12 group")}>
                <Plus className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
                Create Project
              </Link>
              <Link href="/discover" className={cn(buttonVariants({ variant: "outline" }), "w-full rounded-full font-bold justify-start px-6 h-12 group")}>
                <Compass className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform text-primary" />
                Discover Students
              </Link>
              <Link href="/teams" className={cn(buttonVariants({ variant: "outline" }), "w-full rounded-full font-bold justify-start px-6 h-12 group")}>
                <Users className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform text-purple-500" />
                My Teams
              </Link>
              <Link href="/profile/edit" className={cn(buttonVariants({ variant: "ghost" }), "w-full rounded-full font-bold text-muted-foreground hover:text-foreground hover:bg-muted justify-center px-6 h-10 mt-2")}>
                Edit Profile
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}











