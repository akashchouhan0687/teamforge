import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Users, UserPlus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "My Teams — TeamForge",
  description: "Manage and view teams you are part of.",
};

export default async function TeamsPage() {
  const session = await getSession();
  if (!session?.userId) {
    redirect("/login");
  }

  const teams = await db.team.findMany({
    where: {
      OR: [
        { ownerId: session.userId },
        { members: { some: { userId: session.userId } } }
      ]
    },
    include: {
      project: {
        select: { title: true }
      },
      owner: {
        select: { name: true }
      },
      members: true
    },
    orderBy: { createdAt: "desc" }
  });

  const pendingInvitations = await db.teamRequest.findMany({
    where: { receiverId: session.userId, status: 'pending' },
    include: {
      team: { include: { project: true } },
      sender: { select: { name: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-6xl space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-gradient-to-r from-card to-primary/5 rounded-3xl border border-primary/10 p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <Users className="h-4 w-4" />
            <span>Collaboration</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            My Teams
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl font-medium">
            Manage your project teams, view members, and handle invitations.
          </p>
        </div>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Team Invitations <span className="text-muted-foreground text-lg ml-1">({pendingInvitations.length})</span>
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {pendingInvitations.map(inv => (
              <div key={inv.id} className="rounded-3xl border bg-card/60 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow hover:border-emerald-500/30">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                    New Invite
                  </div>
                  <h3 className="font-black text-2xl text-foreground">{inv.team.name}</h3>
                  <p className="text-sm font-bold text-muted-foreground">Project: <span className="text-foreground/80">{inv.team.project?.title}</span></p>
                  <p className="text-xs font-medium text-muted-foreground pt-1">Invited by <span className="text-foreground">{inv.sender.name}</span></p>
                </div>
                <div className="mt-6 flex gap-3">
                  <form action={async () => {
                    "use server";
                    const { acceptTeamInvitation } = await import("@/app/actions/invitations");
                    await acceptTeamInvitation(inv.id);
                  }} className="flex-1">
                    <button type="submit" className={cn(buttonVariants({ variant: "default", size: "lg" }), "w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold shadow-sm")}>
                      Accept
                    </button>
                  </form>
                  <form action={async () => {
                    "use server";
                    const { declineTeamInvitation } = await import("@/app/actions/invitations");
                    await declineTeamInvitation(inv.id);
                  }} className="flex-1">
                    <button type="submit" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full text-destructive hover:bg-destructive/10 hover:border-destructive/30 rounded-full font-bold")}>
                      Decline
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teams Grid or Empty State */}
      <div className="space-y-6">
        {teams.length === 0 ? (
          <div className="rounded-3xl border border-dashed bg-card p-12 text-center max-w-xl mx-auto space-y-6 my-12 shadow-sm relative overflow-hidden group hover:border-primary/40 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary relative z-10">
              <Users className="h-10 w-10" />
            </div>
            <div className="space-y-2 relative z-10">
              <h2 className="text-2xl font-black text-foreground">
                No teams yet
              </h2>
              <p className="text-base font-medium text-muted-foreground leading-relaxed">
                You haven&apos;t joined or created any teams yet. Create a team from one of your projects to get started and invite members.
              </p>
            </div>
            <div className="pt-4 relative z-10">
              <Link
                href="/projects"
                className={cn(buttonVariants({ size: "lg" }), "gap-2 rounded-full font-bold px-8")}
              >
                Go to Projects
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-black flex items-center gap-2">
              Active Teams <span className="text-muted-foreground text-lg ml-1">({teams.length})</span>
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <div key={team.id} className="group rounded-3xl border bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/40 hover:-translate-y-1 flex flex-col justify-between overflow-hidden relative">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors pointer-events-none z-0" />
                  
                  <div className="p-6 relative z-10 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {team.name}
                      </h3>
                      {team.ownerId === session.userId && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[10px] font-black text-primary uppercase tracking-widest border border-primary/20 shrink-0">
                          Owner
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm font-bold text-muted-foreground line-clamp-1 bg-muted/40 px-3 py-1.5 rounded-lg inline-block w-fit">
                      {team.project?.title || "Unknown Project"}
                    </p>
                    
                    <div className="mt-auto pt-6 flex items-center gap-2 text-sm font-bold text-foreground">
                      <div className="flex -space-x-2 mr-2">
                        {[...Array(Math.min(3, team.members.length))].map((_, i) => (
                          <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                            <UserPlus className="h-3 w-3" />
                          </div>
                        ))}
                      </div>
                      <span>
                        {team.members.length} Member{team.members.length === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 pt-0 relative z-10 border-t border-border/50 mt-4">
                    <Link
                      href={`/teams/${team.id}`}
                      className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full rounded-full font-bold mt-4 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-colors")}
                    >
                      View Team Dashboard
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
