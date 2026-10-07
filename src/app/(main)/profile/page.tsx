import { redirect } from "next/navigation";
import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { calculateProfileCompletion } from "@/lib/profile";
import { ProfileCompletionBar } from "@/components/profile/ProfileCompletionBar";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


import { cn } from "@/lib/utils";
import {
  GraduationCap,
  MapPin,
  Calendar,
  Mail,
  Edit3,
  Award,
  Sparkles,
  User as UserIcon,
  FolderGit2,
  Plus,
  ArrowRight,
  Users,
  Code2,
} from "lucide-react";

export const metadata = {
  title: "My Profile — TeamForge",
  description: "View and manage your student profile, skills, and project portfolio on TeamForge.",
};

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.userId) {
    redirect("/login");
  }

  const [user, acceptedConnections, totalConnectionsCount] = await Promise.all([
    db.user.findUnique({
      where: { id: session.userId },
      include: {
        profile: true,
        skills: {
          include: { skill: true },
          orderBy: { skill: { name: "asc" } },
        },
        projects: {
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    db.connection.findMany({
      where: {
        status: 'accepted',
        OR: [
          { senderId: session.userId },
          { receiverId: session.userId }
        ]
      },
      include: {
        sender: { select: { id: true, name: true, image: true, profile: { select: { department: true, year: true, profileImage: true } } } },
        receiver: { select: { id: true, name: true, image: true, profile: { select: { department: true, year: true, profileImage: true } } } }
      },
      take: 6,
      orderBy: { createdAt: 'desc' }
    }),
    db.connection.count({
      where: {
        status: 'accepted',
        OR: [
          { senderId: session.userId },
          { receiverId: session.userId }
        ]
      }
    })
  ]);

  if (!user) {
    redirect("/login");
  }

  const completion = calculateProfileCompletion(user);

  // Parse interests into tags
  const interestsList = user.profile?.interests
    ? user.profile.interests
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean)
    : [];

  const getProficiencyColor = (level?: string | null) => {
    switch (level) {
      case "Advanced":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
      case "Intermediate":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30";
      case "Beginner":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const photoUrl = user.profile?.profileImage || user.image;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl space-y-8">
      {/* Top Banner & Header Card */}
      <div className="rounded-3xl border bg-card p-8 md:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-primary/10 blur-3xl rounded-full pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar / Photo */}
            <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-full overflow-hidden border-4 border-background shadow-md bg-primary/5 flex items-center justify-center shrink-0">
              {photoUrl ? (
                <SafeImage src={photoUrl} alt={user.name} className="h-full w-full object-cover" width={128} height={128} priority />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-primary font-black text-4xl">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
                {user.name}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground font-medium">
                {user.profile?.department && (
                  <span className="text-foreground">
                    {user.profile.department}
                  </span>
                )}
                {user.profile?.year && (
                  <>
                    <span className="text-muted-foreground/40">•</span>
                    <span>{user.profile.year}</span>
                  </>
                )}
                {user.profile?.location && (
                  <>
                    <span className="text-muted-foreground/40">•</span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {user.profile.location}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Link
            href="/profile/edit"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2 shrink-0 rounded-full font-bold")}
          >
            <Edit3 className="h-5 w-5" />
            Edit Profile
          </Link>
        </div>

        {/* Completion Progress Indicator */}
        <div className="mt-8 pt-8 border-t border-border/50 relative z-10">
          <ProfileCompletionBar completion={completion} />
        </div>
      </div>

      {/* Main Grid: Bio, Skills, Details */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column (2 cols): Bio & Skills */}
        <div className="md:col-span-2 space-y-6">
          {/* Bio Card */}
          <Card className="rounded-3xl border-border/60 shadow-sm">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xl font-bold flex items-center gap-2.5">
                <UserIcon className="h-5 w-5 text-primary" />
                About Me
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              {user.profile?.bio ? (
                <p className="text-base text-foreground/90 whitespace-pre-line break-words leading-relaxed font-medium">
                  {user.profile.bio}
                </p>
              ) : (
                <p className="text-sm font-medium text-muted-foreground italic">
                  No bio added yet. Add a short introduction so other students can get to know you.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Skills Card */}
          <Card className="rounded-3xl border-border/60 shadow-sm">
            <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold flex items-center gap-2.5">
                <Award className="h-5 w-5 text-primary" />
                Skills <span className="text-muted-foreground text-sm font-medium ml-1">({user.skills.length})</span>
              </CardTitle>
              <Link
                href="/profile/edit"
                className="text-sm font-bold text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-full"
              >
                Manage
              </Link>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              {user.skills.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-8 text-center bg-muted/20">
                  <p className="text-sm font-medium text-muted-foreground">
                    You haven&apos;t added any skills yet.
                  </p>
                  <Link
                    href="/profile/edit"
                    className={cn(buttonVariants({ size: "sm", variant: "default" }), "mt-4 rounded-full font-bold")}
                  >
                    Add Skills
                  </Link>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {user.skills.map((us) => (
                    <div
                      key={us.skillId}
                      className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-1.5 text-sm shadow-sm"
                    >
                      <span className="font-bold text-foreground">
                        {us.skill.name}
                      </span>
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border",
                          getProficiencyColor(us.proficiency)
                        )}
                      >
                        {us.proficiency || "Intermediate"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interests Card */}
          <Card className="rounded-3xl border-border/60 shadow-sm">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xl font-bold flex items-center gap-2.5">
                <Sparkles className="h-5 w-5 text-primary" />
                Interests & Focus Areas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              {interestsList.length === 0 ? (
                <p className="text-sm font-medium text-muted-foreground italic">
                  No interests listed yet. Add topics, hackathons, or technologies you enjoy.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {interestsList.map((interest) => (
                    <Badge
                      key={interest}
                      variant="secondary"
                      className="px-3 py-1.5 text-sm font-bold bg-muted/60 text-foreground"
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Academic Details & Metadata */}
        <div className="space-y-6">
          <Card className="rounded-3xl border-border/60 shadow-sm">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xl font-bold flex items-center gap-2.5">
                <GraduationCap className="h-5 w-5 text-primary" />
                Academic Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">
                  Department
                </span>
                <span className="font-bold text-foreground text-lg">
                  {user.profile?.department || "Not specified"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">
                  Academic Year
                </span>
                <span className="font-bold text-foreground text-lg">
                  {user.profile?.year || "Not specified"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">
                  Location
                </span>
                <span className="font-bold text-foreground text-lg">
                  {user.profile?.location || "Not specified"}
                </span>
              </div>

              <div className="pt-4 border-t border-border/50 text-sm space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground font-medium">
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground font-medium">
                  <Calendar className="h-4 w-4 shrink-0 text-primary" />
                  <span>
                    Joined{" "}
                    {user.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Projects Section */}
      <Card className="rounded-3xl border-border/60 shadow-sm">
        <CardHeader className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/50">
          <div>
            <CardTitle className="text-2xl font-black flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                <FolderGit2 className="h-5 w-5" />
              </div>
              Projects <span className="text-muted-foreground text-lg ml-1">({user.projects.length})</span>
            </CardTitle>
            <p className="text-sm font-medium text-muted-foreground mt-2">
              Portfolio projects and student team work.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/projects"
              className={cn(buttonVariants({ variant: "outline", size: "default" }), "rounded-full font-bold")}
            >
              Manage Projects
            </Link>
            <Link
              href="/projects/new"
              className={cn(buttonVariants({ size: "default" }), "gap-2 rounded-full font-bold")}
            >
              <Plus className="h-4 w-4" />
              Add Project
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          {user.projects.length === 0 ? (
            <div className="rounded-3xl border border-dashed p-12 text-center space-y-3 bg-muted/10">
              <FolderGit2 className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <div className="space-y-1">
                <p className="text-lg font-bold text-foreground">
                  No projects added yet.
                </p>
                <p className="text-sm font-medium text-muted-foreground max-w-md mx-auto">
                  Showcase projects you&apos;ve built to highlight your skills to peers and potential team leads.
                </p>
              </div>
              <Link
                href="/projects/new"
                className={cn(buttonVariants({ size: "default" }), "gap-2 mt-4 rounded-full font-bold")}
              >
                <Plus className="h-4 w-4" />
                Add Your First Project
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {user.projects.map((project) => {
                const image = project.imageUrl || project.image;
                const techList = project.technologies
                  ? project.technologies
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                  : [];

                return (
                  <div
                    key={project.id}
                    className="group rounded-3xl border bg-card/60 shadow-sm overflow-hidden flex flex-col justify-between hover:border-primary/40 transition-all hover:shadow-lg hover:-translate-y-1"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-40 w-full bg-muted/40 border-b border-border/50 overflow-hidden flex items-center justify-center">
                      {image ? (
                        <>
                          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors z-10" />
                          <SafeImage src={image} alt={project.title} className="object-cover group-hover:scale-105 transition-transform duration-500" fill sizes="(max-width: 768px) 100vw, 50vw" />
                        </>
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 flex items-center justify-center">
                          <Code2 className="h-10 w-10 text-primary/20 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                      )}
                    </div>

                    <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <Link
                          href={`/projects/${project.id}`}
                          className="font-black text-lg text-foreground hover:text-primary transition-colors line-clamp-1"
                        >
                          {project.title}
                        </Link>
                        {project.role && (
                          <p className="text-xs font-bold text-primary/80 uppercase tracking-wider">
                            Role: {project.role}
                          </p>
                        )}
                        {techList.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {techList.slice(0, 3).map((t) => (
                              <Badge
                                key={t}
                                variant="secondary"
                                className="text-[10px] px-2 py-0.5 font-bold bg-muted/60"
                              >
                                {t}
                              </Badge>
                            ))}
                            {techList.length > 3 && (
                              <span className="text-[10px] font-bold text-muted-foreground self-center px-1">
                                +{techList.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-4 mt-2 border-t border-border/50">
                        <Link
                          href={`/projects/${project.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-full transition-colors -ml-3"
                        >
                          View Project <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}        </CardContent>
      </Card>

      {/* Connections Card */}
      <Card className="rounded-3xl border-border/60 shadow-sm mt-8">
        <CardHeader className="p-6 md:p-8 flex flex-row items-center justify-between pb-6 border-b border-border/50">
          <div>
            <CardTitle className="text-2xl font-black flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              Connections <span className="text-muted-foreground text-lg ml-1">({totalConnectionsCount})</span>
            </CardTitle>
          </div>
          {totalConnectionsCount > 0 && (
            <Link
              href="/connections"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:bg-primary/10 px-4 py-2 rounded-full transition-colors"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          {acceptedConnections.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/60 p-10 text-center bg-muted/20 flex flex-col items-center justify-center">
              <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <h3 className="font-bold text-foreground text-lg">No connections yet</h3>
              <p className="text-sm text-muted-foreground font-medium mt-1 mb-4 max-w-sm">
                Connect with students to build your network.
              </p>
              <Link
                href="/discover"
                className={cn(buttonVariants({ variant: "default", size: "default" }), "rounded-full font-bold gap-2")}
              >
                Discover Students <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {acceptedConnections.map((conn) => {
                const otherUser = conn.senderId === session.userId ? conn.receiver : conn.sender;
                const photoUrl = otherUser.profile?.profileImage || otherUser.image;
                
                return (
                  <Link
                    key={conn.id}
                    href={/profile/ + otherUser.id}
                    className="group flex items-center gap-4 p-4 rounded-2xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all overflow-hidden"
                  >
                    <div className="h-14 w-14 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0 border-2 border-background shadow-sm">
                      {photoUrl ? (
                        <SafeImage src={photoUrl} alt={otherUser.name} className="h-full w-full object-cover" width={56} height={56} />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground bg-primary/5 font-black text-lg">
                          {otherUser.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-base text-foreground group-hover:text-primary transition-colors truncate">
                        {otherUser.name}
                      </p>
                      <p className="text-xs font-bold text-muted-foreground truncate mt-0.5">
                        {otherUser.profile?.department || "No Department"}
                      </p>
                      {otherUser.profile?.year && (
                        <p className="text-[10px] font-bold text-muted-foreground/70 truncate mt-0.5 uppercase tracking-wider">
                          {otherUser.profile.year}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
        </div>
      </main>

      
    </div>
  );
}





