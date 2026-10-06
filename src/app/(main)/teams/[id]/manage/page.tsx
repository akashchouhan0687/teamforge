import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, User, LogOut, Trash2, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeleteTeamButton } from "@/components/teams/DeleteTeamButton";

interface TeamManagePageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Manage Team — TeamForge",
};

export default async function TeamManagePage({ params }: TeamManagePageProps) {
  const { id } = await params;
  const session = await getSession();

  if (!session?.userId) {
    redirect("/login");
  }

  const team = await db.team.findUnique({
    where: { id },
    include: {
      project: true,
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
              }
            }
          }
        },
        orderBy: { joinedAt: "asc" }
      },
      requests: {
        where: { status: 'pending' },
        include: {
          receiver: {
            select: { name: true, image: true, profile: { select: { profileImage: true } } }
          }
        }
      }
    }
  });

  if (!team) {
    notFound();
  }

  const isOwner = team.ownerId === session.userId;
  const isMember = team.members.some(m => m.userId === session.userId);

  if (!isMember && !isOwner) {
    redirect("/teams");
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-3xl space-y-10">
      {/* Navigation Header */}
      <div>
        <Link
          href={`/teams/${team.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-bold mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Team
        </Link>
        <div className="bg-gradient-to-r from-card to-primary/5 rounded-3xl border border-primary/10 p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/10 blur-3xl rounded-full pointer-events-none"></div>
          <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3 relative z-10">
            <Settings className="h-8 w-8 text-primary" />
            Team Management
          </h1>
          <p className="text-muted-foreground font-medium text-lg mt-3 relative z-10">
            Manage your team settings and members.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Team Information */}
        <div className="rounded-3xl border bg-card p-6 md:p-8 shadow-sm space-y-6">
          <h2 className="text-2xl font-black border-b border-border/50 pb-4">Team Information</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-muted/30 p-4 rounded-2xl border border-border/50">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Team Name</span>
              <p className="font-bold text-foreground text-lg">{team.name}</p>
            </div>
            <div className="bg-muted/30 p-4 rounded-2xl border border-border/50">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Project</span>
              <p className="font-bold text-foreground text-lg">{team.project?.title || "None"}</p>
            </div>
            <div className="bg-muted/30 p-4 rounded-2xl border border-border/50">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Members</span>
              <p className="font-bold text-foreground text-lg">{team.members.length} {team.project?.teamSize ? `/ ${team.project.teamSize}` : ""}</p>
            </div>
            {team.project?.teamSize && (
              <div className="bg-muted/30 p-4 rounded-2xl border border-border/50">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Maximum Team Size</span>
                <p className="font-bold text-foreground text-lg">{team.project.teamSize} members</p>
              </div>
            )}
          </div>
        </div>

        {/* Member Management */}
        <div className="rounded-3xl border bg-card p-6 md:p-8 shadow-sm space-y-6">
          <h2 className="text-2xl font-black border-b border-border/50 pb-4">Manage Members</h2>
          
          <div className="space-y-4">
            {team.members.map(member => (
              <div key={member.userId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border bg-background shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border/50">
                    {member.user.profile?.profileImage || member.user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={member.user.profile?.profileImage || member.user.image!} alt={member.user.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/5 text-muted-foreground font-black text-lg">
                        {member.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-lg text-foreground">{member.user.name}</span>
                      {member.role === 'OWNER' && (
                        <Badge variant="default" className="text-[10px] px-2 py-0.5 font-black uppercase tracking-widest">Owner</Badge>
                      )}
                    </div>
                    <p className="text-xs font-bold text-muted-foreground mt-0.5">
                      {member.user.profile?.department || "No department specified"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Owner can remove members (except themselves) */}
                  {isOwner && member.userId !== session.userId && (
                    <form action={async () => {
                      "use server";
                      const { removeTeamMember } = await import("@/app/actions/teams");
                      await removeTeamMember(team.id, member.userId);
                    }}>
                      <button type="submit" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full font-bold px-4")}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </button>
                    </form>
                  )}
                  
                  {/* Normal member can leave */}
                  {!isOwner && member.userId === session.userId && (
                    <form action={async () => {
                      "use server";
                      const { leaveTeam } = await import("@/app/actions/teams");
                      await leaveTeam(team.id);
                    }}>
                      <button type="submit" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-destructive border-destructive hover:bg-destructive/10 rounded-full font-bold px-4")}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Leave Team
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Invitations */}
        {isOwner && team.requests.length > 0 && (
          <div className="rounded-3xl border bg-card p-6 md:p-8 shadow-sm space-y-6">
            <h2 className="text-2xl font-black border-b border-border/50 pb-4">Pending Invitations</h2>
            
            <div className="space-y-4">
              {team.requests.map(request => (
                <div key={request.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border/50 bg-background shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border/50">
                      {request.receiver.profile?.profileImage || request.receiver.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={request.receiver.profile?.profileImage || request.receiver.image!} alt={request.receiver.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/5 text-muted-foreground font-black text-lg">
                          {request.receiver.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="font-black text-lg text-foreground">{request.receiver.name}</span>
                      <p className="text-xs font-bold text-muted-foreground mt-0.5 bg-muted/50 px-2 py-0.5 rounded-md inline-block">
                        Invited {request.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <form action={async () => {
                    "use server";
                    const { cancelTeamInvitation } = await import("@/app/actions/invitations");
                    await cancelTeamInvitation(request.id);
                  }}>
                    <button type="submit" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full font-bold px-4")}>
                      Cancel Invite
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Danger Zone */}
        {isOwner && (
          <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-destructive/50" />
            <h2 className="text-2xl font-black text-destructive border-b border-destructive/20 pb-4">Danger Zone</h2>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="text-sm text-foreground/80 space-y-1">
                <p className="font-black text-foreground text-lg">Delete Team</p>
                <p className="font-medium opacity-90">This action cannot be undone. The team and its membership data will be permanently removed.</p>
              </div>
              <div className="shrink-0">
                <DeleteTeamButton teamId={team.id} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
