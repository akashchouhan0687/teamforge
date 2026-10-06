import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";


import { cn } from "@/lib/utils";
import { Bell, CheckCircle2, UserPlus, Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "Notifications — TeamForge",
};

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const notifications = await db.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' }
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'CONNECTION_REQUEST':
      case 'CONNECTION_ACCEPTED':
        return <UserPlus className="h-5 w-5 text-blue-500" />;
      case 'TEAM_INVITATION':
      case 'INVITATION_ACCEPTED':
      case 'INVITATION_DECLINED':
        return <Users className="h-5 w-5 text-indigo-500" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getLink = (type: string) => {
    switch (type) {
      case 'CONNECTION_REQUEST':
      case 'CONNECTION_ACCEPTED':
        return "/connections";
      case 'TEAM_INVITATION':
        return "/teams"; // or a specific team requests page if we had one. Teams page can show invitations.
      default:
        return "/dashboard";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
                <Bell className="h-8 w-8 text-primary" /> Notifications
              </h1>
              <p className="text-muted-foreground font-medium mt-2">Stay updated on your network and teams.</p>
            </div>
            {notifications.some(n => !n.read) && (
              <form action={async () => {
                "use server";
                const { markAllNotificationsAsRead } = await import("@/app/actions/notifications");
                await markAllNotificationsAsRead();
              }}>
                <button type="submit" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full font-bold shadow-sm")}>
                  Mark all as read
                </button>
              </form>
            )}
          </div>

          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-20 border border-dashed rounded-3xl bg-card">
                <div className="h-20 w-20 bg-primary/5 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bell className="h-10 w-10 text-primary/50" />
                </div>
                <p className="text-2xl font-black text-foreground">No notifications</p>
                <p className="text-base font-medium text-muted-foreground mt-2">You&apos;re all caught up!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={cn(
                      "flex items-start gap-4 p-5 md:p-6 rounded-3xl border transition-all hover:shadow-md",
                      notif.read ? "bg-card border-border/50" : "bg-primary/5 border-primary/30 relative overflow-hidden"
                    )}
                  >
                    {!notif.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-3xl" />
                    )}
                    <div className={cn(
                      "mt-1 p-3 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                      notif.read ? "bg-background border border-border/50" : "bg-background border border-primary/20"
                    )}>
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className={cn("text-lg font-black", notif.read ? "text-foreground" : "text-primary")}>{notif.title}</h3>
                        <span className="text-[10px] font-bold text-muted-foreground shrink-0 uppercase tracking-widest bg-muted/50 px-2 py-1 rounded-md">
                          {notif.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground mt-1.5 leading-relaxed">{notif.message}</p>
                      
                      <div className="mt-4 flex items-center gap-3">
                        <Link href={getLink(notif.type)} className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "rounded-full font-bold px-4")}>
                          View Details
                        </Link>
                        {!notif.read && (
                          <form action={async () => {
                            "use server";
                            const { markNotificationAsRead } = await import("@/app/actions/notifications");
                            await markNotificationAsRead(notif.id);
                          }}>
                            <button type="submit" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-full font-bold px-4 text-muted-foreground hover:text-foreground hover:bg-muted/50")}>
                              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Mark read
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
    </div>
  );
}
