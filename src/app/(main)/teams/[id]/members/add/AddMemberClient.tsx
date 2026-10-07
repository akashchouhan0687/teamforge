"use client";

import { useState, useTransition } from "react";
import { sendTeamInvitation } from "@/app/actions/invitations";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, X, User as UserIcon, Search, MapPin, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface Skill {
  id: string;
  name: string;
}

interface UserSkill {
  skill: Skill;
  proficiency?: string | null;
}

interface StudentUser {
  id: string;
  name: string;
  image: string | null;
  profile: {
    department: string | null;
    year: string | null;
    bio: string | null;
    location: string | null;
    profileImage: string | null;
    interests: string | null;
  } | null;
  skills: UserSkill[];
  hasPendingInvite?: boolean;
}

export function AddMemberClient({ 
  team, 
  availableUsers, 
  projectRequiredSkills 
}: { 
  team: any, 
  availableUsers: StudentUser[], 
  projectRequiredSkills: string[] 
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentUser | null>(null);
  
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const isTeamFull = team.project?.teamSize ? team.members.length >= team.project.teamSize : false;

  const handleAdd = () => {
    if (!selectedStudent || isTeamFull) return;
    
    setError(null);
    startTransition(async () => {
      try {
        await sendTeamInvitation(team.id, selectedStudent.id);
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || "Failed to send invitation");
      }
    });
  };

  const filteredUsers = availableUsers.filter(u => {
    const q = searchQuery.toLowerCase();
    if (u.name.toLowerCase().includes(q)) return true;
    if (u.profile?.department?.toLowerCase().includes(q)) return true;
    if (u.skills.some(s => s.skill.name.toLowerCase().includes(q))) return true;
    return false;
  });

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-5xl space-y-10">
      {/* Header */}
      <div>
        <Link
          href={`/teams/${team.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-bold mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Team
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-gradient-to-r from-card to-primary/5 rounded-3xl border border-primary/10 p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/10 blur-3xl rounded-full pointer-events-none"></div>
          <div className="relative z-10 space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">Invite Team Member</h1>
            <p className="text-muted-foreground font-medium text-lg">
              Find the right student to strengthen your team.
            </p>
          </div>
          <div className="relative z-10 text-right p-4 rounded-2xl border border-border/50 bg-background/80 backdrop-blur shrink-0 min-w-[200px]">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1">Target Team</p>
            <p className="font-black text-xl text-foreground line-clamp-1">{team.name}</p>
            <p className="font-bold text-muted-foreground mt-1 text-sm">
              <span className="text-foreground">{team.members.length}</span> {team.project?.teamSize ? `/ ${team.project.teamSize}` : ""} members
            </p>
          </div>
        </div>
      </div>

      {isTeamFull && (
        <div className="p-6 border border-destructive/30 bg-destructive/5 text-destructive rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-destructive/50" />
          <div className="pl-2">
            <h3 className="font-black text-xl">Team is full</h3>
            <p className="text-sm font-medium mt-1 opacity-90">Your team has reached the maximum size for this project. Manage your team to make changes.</p>
          </div>
          <Link href={`/teams/${team.id}/manage`} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full font-bold border-destructive/20 hover:bg-destructive/10 shrink-0")}>
            Team Manage
          </Link>
        </div>
      )}

      {/* Search Area */}
      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="relative w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
          <Input 
            placeholder="Search students by name, department, or skill..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-14 py-8 rounded-2xl text-lg font-medium bg-background shadow-inner border-border/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-foreground">
            Available Students <span className="text-muted-foreground text-lg ml-1">({filteredUsers.length})</span>
          </h2>
        </div>

        {availableUsers.length === 0 ? (
          <div className="text-center py-20 border border-dashed rounded-3xl bg-card">
            <p className="text-2xl font-black text-foreground">No students available</p>
            <p className="text-base font-medium text-muted-foreground mt-2">All eligible students are already members of this team.</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 border border-dashed rounded-3xl bg-card">
            <p className="text-2xl font-black text-foreground">No students match your search</p>
            <p className="text-base font-medium text-muted-foreground mt-2">Try changing your search terms.</p>
            <button 
              onClick={() => setSearchQuery("")}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-6 rounded-full font-bold")}
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map(student => {
              const image = student.profile?.profileImage || student.image;
              const matchingSkills = student.skills.filter(s => 
                projectRequiredSkills.some(req => req.toLowerCase() === s.skill.name.toLowerCase())
              );
              
              return (
                <div 
                  key={student.id} 
                  className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm flex flex-col h-full animate-hover-lift hover:border-primary/30 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors pointer-events-none z-0" />
                  
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="h-16 w-16 rounded-full overflow-hidden bg-muted shrink-0 flex items-center justify-center border-2 border-background shadow-sm">
                      {image ? (
                        <SafeImage src={image} alt={student.name} className="h-full w-full object-cover" width={64} height={64} />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/5 text-muted-foreground font-black text-xl">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 mt-1">
                      <h3 className="font-black text-xl text-foreground truncate group-hover:text-primary transition-colors">{student.name}</h3>
                      <p className="text-xs font-bold text-muted-foreground truncate mt-0.5">
                        {student.profile?.department || "No Department"} {student.profile?.year ? `• ${student.profile.year}` : ""}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex-1 space-y-5 relative z-10">
                    <div>
                      <span className="text-[10px] font-black text-foreground uppercase tracking-widest block">Skills</span>
                      {student.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {student.skills.slice(0, 4).map(s => (
                            <Badge key={s.skill.id} variant="outline" className="px-2 py-0.5 text-muted-foreground font-bold bg-background">
                              {s.skill.name}
                            </Badge>
                          ))}
                          {student.skills.length > 4 && (
                            <span className="text-[10px] font-bold text-muted-foreground ml-1 self-center">+{student.skills.length - 4}</span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs font-medium text-muted-foreground italic mt-2">No skills listed</p>
                      )}
                    </div>
                    
                    {matchingSkills.length > 0 && (
                      <div className="pt-2 border-t border-border/50">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          Matches Project
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {matchingSkills.slice(0,3).map(s => (
                            <span key={s.skill.id} className="text-[11px] font-bold text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md">
                              {s.skill.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-5 border-t border-border/50 flex flex-wrap items-center gap-3 relative z-10">
                    <button 
                      onClick={() => setSelectedStudent(student)}
                      className={cn(buttonVariants({ variant: "outline", size: "lg" }), "flex-1 rounded-full font-bold")}
                    >
                      View Profile
                    </button>
                    {!isTeamFull && (
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                        }}
                        className={cn(buttonVariants({ variant: "default", size: "lg" }), "flex-1 rounded-full font-bold shadow-sm")}
                      >
                        Invite to Team
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Profile Preview Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4">
          <div className="bg-card w-full max-w-md rounded-3xl border border-border/60 shadow-2xl flex flex-col max-h-[90vh] relative overflow-hidden">
            <div className="flex justify-end p-6 pb-0 absolute top-0 right-0 z-20">
              <button 
                onClick={() => {
                  setSelectedStudent(null);
                  setError(null);
                  if (success) {
                    setSuccess(false);
                    router.refresh();
                  }
                }} 
                className="rounded-full p-3 bg-muted/40 hover:bg-muted/80 transition-colors"
                disabled={isPending}
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="px-8 pb-8 pt-10 overflow-y-auto relative z-10">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-28 w-28 rounded-full overflow-hidden bg-muted border-4 border-background shadow-sm flex items-center justify-center">
                  {selectedStudent.profile?.profileImage || selectedStudent.image ? (
                    <SafeImage src={selectedStudent.profile?.profileImage || selectedStudent.image!} alt={selectedStudent.name} className="h-full w-full object-cover" width={112} height={112} />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/5 text-muted-foreground font-black text-4xl">
                      {selectedStudent.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div>
                  <h2 className="text-3xl font-black text-foreground">{selectedStudent.name}</h2>
                  <p className="text-sm font-bold text-muted-foreground mt-2">
                    {selectedStudent.profile?.department || "No Department"} {selectedStudent.profile?.year ? `• ${selectedStudent.profile.year}` : ""}
                  </p>
                </div>
                
                {selectedStudent.profile?.bio && (
                  <p className="text-sm font-medium text-foreground/90 italic max-w-xs mx-auto pt-2">
                    &ldquo;{selectedStudent.profile.bio}&rdquo;
                  </p>
                )}
                
                {selectedStudent.profile?.location && (
                  <div className="flex items-center text-sm font-bold text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                    <MapPin className="h-4 w-4 mr-1.5" />
                    {selectedStudent.profile.location}
                  </div>
                )}
              </div>
              
              <div className="my-8 w-full border-t border-border/50"></div>
              
              <div className="space-y-8">
                {selectedStudent.skills.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black text-foreground tracking-widest uppercase">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.skills.map(s => {
                        const isMatch = projectRequiredSkills.some(req => req.toLowerCase() === s.skill.name.toLowerCase());
                        return (
                          <Badge 
                            key={s.skill.id} 
                            variant="secondary" 
                            className={cn(
                              "px-2.5 py-1 font-bold",
                              isMatch ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-muted/50 text-foreground"
                            )}
                          >
                            {s.skill.name}
                            {s.proficiency && <span className="opacity-60 ml-1.5 font-medium hidden sm:inline">({s.proficiency})</span>}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {selectedStudent.profile?.interests && (
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black text-foreground tracking-widest uppercase">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.profile.interests.split(",").map(interest => (
                        <span key={interest} className="text-[11px] font-bold bg-background px-3 py-1.5 rounded-md text-muted-foreground border border-border/50">
                          {interest.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 md:p-8 pt-6 border-t border-border/50 bg-muted/20 space-y-5 rounded-b-3xl">
              {error && (
                <div className="p-4 text-sm font-bold text-destructive bg-destructive/10 rounded-xl border border-destructive/20 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive/50" />
                  <span className="pl-2">{error}</span>
                </div>
              )}
              
              {success ? (
                <div className="space-y-4">
                  <div className="p-4 text-sm text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 rounded-xl font-black text-center relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/50" />
                    Team invitation sent successfully! 🎉
                  </div>
                  <Link href={`/teams/${team.id}`} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full rounded-full font-bold")}>
                    Back to Team
                  </Link>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleAdd}
                      disabled={isPending || isTeamFull || selectedStudent.hasPendingInvite}
                      className={cn(buttonVariants({ variant: selectedStudent.hasPendingInvite ? "secondary" : "default", size: "lg" }), "w-full rounded-full font-bold shadow-sm")}
                    >
                      {isPending ? (
                        <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Sending...</>
                      ) : selectedStudent.hasPendingInvite ? (
                        "Invitation Already Sent"
                      ) : isTeamFull ? (
                        "Team is Full"
                      ) : (
                        "Invite to Team"
                      )}
                    </button>
                  <div className="text-center pt-2">
                    <Link 
                      href={`/profile/${selectedStudent.id}`} 
                      target="_blank"
                      className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                    >
                      View Full Profile
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





