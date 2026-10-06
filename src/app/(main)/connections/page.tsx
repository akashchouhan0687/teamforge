import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";


import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { UserIcon, MapPin, Check, X, Clock } from "lucide-react";

export const metadata = {
  title: "Connections — TeamForge",
};

export default async function ConnectionsPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const connections = await db.connection.findMany({
    where: {
      OR: [
        { senderId: session.userId },
        { receiverId: session.userId }
      ]
    },
    include: {
      sender: {
        select: { id: true, name: true, image: true, profile: true, skills: { include: { skill: true } } }
      },
      receiver: {
        select: { id: true, name: true, image: true, profile: true, skills: { include: { skill: true } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const pendingReceived = connections.filter(c => c.status === 'pending' && c.receiverId === session.userId);
  const pendingSent = connections.filter(c => c.status === 'pending' && c.senderId === session.userId);
  const activeConnections = connections.filter(c => c.status === 'accepted');

  const ConnectionCard = ({ conn, isReceived }: { conn: any, isReceived?: boolean }) => {
    const otherUser = conn.senderId === session.userId ? conn.receiver : conn.sender;
    const photoUrl = otherUser.profile?.profileImage || otherUser.image;
    
    return (
      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm flex flex-col h-full hover:shadow-lg hover:border-primary/40 transition-all group relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-20 h-20 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
        
        <div className="flex items-start gap-4 relative z-10">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0 border-2 border-background shadow-sm">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt={otherUser.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground bg-primary/5 font-black text-xl">
                {otherUser.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 mt-1">
            <Link href={`/profile/${otherUser.id}`} className="font-black text-lg text-foreground hover:text-primary transition-colors truncate block">
              {otherUser.name}
            </Link>
            <p className="text-xs font-bold text-muted-foreground truncate mt-0.5">
              {otherUser.profile?.department || "No Department"} {otherUser.profile?.year ? `• ${otherUser.profile.year}` : ""}
            </p>
          </div>
        </div>

        <div className="mt-6 flex-1 relative z-10">
          {otherUser.skills.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-black text-foreground uppercase tracking-widest block">Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {otherUser.skills.slice(0, 3).map((s: any) => (
                  <span key={s.skill.id} className="text-[10px] font-bold px-2 py-1 rounded-md border border-border/50 text-muted-foreground bg-background">
                    {s.skill.name}
                  </span>
                ))}
                {otherUser.skills.length > 3 && (
                  <span className="text-[10px] font-bold text-muted-foreground ml-1 self-center">+{otherUser.skills.length - 3}</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-5 border-t border-border/50 flex flex-col sm:flex-row gap-3 relative z-10">
          {conn.status === 'accepted' && (
            <Link href={`/profile/${otherUser.id}`} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full rounded-full font-bold")}>
              View Profile
            </Link>
          )}
          {conn.status === 'pending' && isReceived && (
            <>
              <form action={async () => {
                "use server";
                const { acceptConnectionRequest } = await import("@/app/actions/connections");
                await acceptConnectionRequest(conn.id);
              }} className="flex-1">
                <button type="submit" className={cn(buttonVariants({ variant: "default", size: "lg" }), "w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold shadow-sm px-4")}>
                  <Check className="h-5 w-5 mr-1" /> Accept
                </button>
              </form>
              <form action={async () => {
                "use server";
                const { declineConnectionRequest } = await import("@/app/actions/connections");
                await declineConnectionRequest(conn.id);
              }} className="flex-1">
                <button type="submit" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full text-destructive hover:bg-destructive/10 border-destructive/20 rounded-full font-bold px-4")}>
                  <X className="h-5 w-5 mr-1" /> Decline
                </button>
              </form>
            </>
          )}
          {conn.status === 'pending' && !isReceived && (
            <div className="w-full flex items-center justify-center gap-1.5 py-2 text-sm font-bold text-muted-foreground bg-muted/40 rounded-full border border-border/50">
              <Clock className="h-4 w-4" /> Request Sent
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl space-y-12">
          <div className="bg-gradient-to-r from-card to-primary/5 rounded-3xl border border-primary/10 p-8 md:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-primary/10 blur-3xl rounded-full pointer-events-none"></div>
            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                <UserIcon className="h-4 w-4" />
                <span>Network</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">Connections</h1>
              <p className="text-lg font-medium text-muted-foreground mt-1 max-w-2xl">
                Manage your network, find collaborators, and review requests.
              </p>
            </div>
          </div>

          <div className="space-y-16">
            {/* Pending Received */}
            {pendingReceived.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black flex items-center gap-3">
                  Pending Requests 
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                    {pendingReceived.length}
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {pendingReceived.map(conn => (
                    <ConnectionCard key={conn.id} conn={conn} isReceived={true} />
                  ))}
                </div>
              </div>
            )}

            {/* Active Connections */}
            <div className="space-y-6">
              <h2 className="text-2xl font-black">Your Network <span className="text-muted-foreground text-lg ml-1">({activeConnections.length})</span></h2>
              {activeConnections.length === 0 ? (
                <div className="text-center py-20 border border-dashed rounded-3xl bg-card relative overflow-hidden group hover:border-primary/30 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className="relative z-10 space-y-4">
                    <p className="text-2xl font-black text-foreground">No connections yet</p>
                    <p className="text-base font-medium text-muted-foreground">Discover students and build your network.</p>
                    <Link href="/discover" className={cn(buttonVariants({ size: "lg" }), "mt-4 rounded-full font-bold shadow-sm")}>
                      Find Students
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {activeConnections.map(conn => (
                    <ConnectionCard key={conn.id} conn={conn} />
                  ))}
                </div>
              )}
            </div>

            {/* Pending Sent */}
            {pendingSent.length > 0 && (
              <div className="space-y-6 pt-10 border-t border-border/50">
                <h2 className="text-xl font-black text-muted-foreground">Sent Requests</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 opacity-75 hover:opacity-100 transition-opacity">
                  {pendingSent.map(conn => (
                    <ConnectionCard key={conn.id} conn={conn} isReceived={false} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
    </div>
  );
}
