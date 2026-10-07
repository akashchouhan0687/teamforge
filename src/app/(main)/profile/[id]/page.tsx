import { notFound } from "next/navigation";
import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { calculateProfileCompletion } from "@/lib/profile";
import { matchProfiles, ProfileInput } from "@/lib/matching";
import { ProfileCompletionBar } from "@/components/profile/ProfileCompletionBar";


import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GithubIcon } from "@/components/icons/GithubIcon";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  MapPin,
  Calendar,
  Edit3,
  Award,
  Sparkles,
  User as UserIcon,
  FolderGit2,
  Plus,
  ArrowRight,
  Code2,
  ArrowLeft,
  ExternalLink,
  Zap,
  Check,
} from "lucide-react";

import { ConnectionButton } from "@/components/profile/ConnectionButton";

interface StudentProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: StudentProfilePageProps) {
  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id },
    select: {
      name: true,
      profile: {
        select: {
          department: true,
          year: true,
        },
      },
    },
  });

  if (!user) {
    return { title: "Student Not Found — TeamForge" };
  }

  const subInfo = [user.profile?.department, user.profile?.year]
    .filter(Boolean)
    .join(" • ");

  return {
    title: `${user.name}${subInfo ? ` (${subInfo})` : ""} — TeamForge`,
    description: `View ${user.name}'s student profile, skills, and projects on TeamForge.`,
  };
}

export default async function StudentProfilePage({
  params,
}: StudentProfilePageProps) {
  const { id } = await params;
  const session = await getSession();

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      image: true,
      createdAt: true,
      profile: {
        select: {
          department: true,
          year: true,
          bio: true,
          location: true,
          profileImage: true,
          interests: true,
          availability: true,
        },
      },
      skills: {
        select: {
          skillId: true,
          proficiency: true,
          skill: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
        },
        orderBy: { skill: { name: "asc" } },
      },
      projects: {
        select: {
          id: true,
          title: true,
          description: true,
          role: true,
          technologies: true,
          githubUrl: true,
          liveUrl: true,
          imageUrl: true,
          image: true,
          createdAt: true,
          skills: {
            include: { skill: true }
          }
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });


  if (!user) {
    notFound();
  }

  const isOwner = session?.userId === user.id;
  const completion = isOwner ? calculateProfileCompletion(user) : null;

  // Parse comma-separated interests
  const interestsList = user.profile?.interests
    ? user.profile.interests
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean)
    : [];

  // ── Compatibility section (viewer, not owner) ──────────────────
  // Only calculate when: logged in, not viewing own profile
  let compatibility: Awaited<ReturnType<typeof matchProfiles>> | null = null;

  if (session?.userId && !isOwner) {
    const viewerUser = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        profile: {
          select: {
            department: true,
            year: true,
            interests: true,
            availability: true,
          },
        },
        skills: {
          select: {
            proficiency: true,
            skill: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (viewerUser?.profile) {
      const viewerProfile: ProfileInput = {
        id: viewerUser.id,
        department: viewerUser.profile.department ?? null,
        year: viewerUser.profile.year ?? null,
        interests: (viewerUser.profile.interests ?? "")
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean),
        availability: viewerUser.profile.availability ?? null,
        skills: viewerUser.skills.map((us) => ({
          id: us.skill.id,
          name: us.skill.name,
          proficiency: us.proficiency,
        })),
      };

      const targetProfile: ProfileInput = {
        id: user.id,
        department: user.profile?.department ?? null,
        year: user.profile?.year ?? null,
        interests: interestsList,
        availability: user.profile?.availability ?? null,
        skills: user.skills.map((us) => ({
          id: us.skill.id,
          name: us.skill.name,
          proficiency: us.proficiency,
        })),
      };

      compatibility = matchProfiles(viewerProfile, targetProfile, {
        name: user.name,
        image: user.image,
        profileImage: user.profile?.profileImage ?? null,
      });
    }
  }

  // ── Connection section (viewer, not owner) ──────────────────
  let connectionStatus: string | null = null;
  let isConnectionSender = false;
  
  if (session?.userId && !isOwner) {
    const conn = await db.connection.findFirst({
      where: {
        OR: [
          { senderId: session.userId, receiverId: user.id },
          { senderId: user.id, receiverId: session.userId }
        ]
      }
    });
    if (conn) {
      connectionStatus = conn.status;
      isConnectionSender = conn.senderId === session.userId;
    }
  }

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
        <div className="container mx-auto px-4 md:px-6 max-w-5xl space-y-6">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <Link
              href="/discover"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Discover
            </Link>

            {isOwner && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                Your Public Profile
              </span>
            )}
          </div>

          {/* Top Profile Header Card */}
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

                  {user.profile?.availability && (
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-2 text-sm font-bold px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        {user.profile.availability}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Owner Edit Action or Connection Button */}
              {isOwner ? (
                <Link
                  href="/profile/edit"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "gap-2 shrink-0 rounded-full font-bold"
                  )}
                >
                  <Edit3 className="h-5 w-5" />
                  Edit Profile
                </Link>
              ) : session?.userId ? (
                <div className="shrink-0">
                  <ConnectionButton 
                    receiverId={user.id} 
                    initialStatus={connectionStatus} 
                    isSender={isConnectionSender} 
                  />
                </div>
              ) : null}
            </div>

            {/* Profile Completion Indicator (Owner only) */}
            {isOwner && completion && (
              <div className="mt-8 pt-8 border-t border-border/50">
                <ProfileCompletionBar completion={completion} />
              </div>
            )}
          </div>

          {/* Compatibility Widget (Viewer only) */}
          {compatibility && (
            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center gap-8 hover:bg-primary/10 transition-colors">
              <div className="flex-1 space-y-3 text-center md:text-left">
                <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                  <Zap className="h-4 w-4" />
                  Compatibility
                </div>
                <h3 className="text-2xl font-black text-foreground">
                  You are a <span className="text-primary">{compatibility.overallScore}% match</span> with {user.name}
                </h3>
                <p className="text-base font-medium text-muted-foreground max-w-2xl">
                  {compatibility.reasons.length > 0
                    ? compatibility.reasons[0]
                    : "Your skills and interests have some overlap."}
                </p>
              </div>
              <div className="shrink-0 flex items-center justify-center h-24 w-24 rounded-full border-4 border-primary/20 bg-background text-3xl font-black text-primary shadow-sm">
                {compatibility.overallScore}%
              </div>
            </div>
          )}

          {/* Main Content Grid: Bio, Skills, Interests & Academic Info */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Left Column (2 cols): Bio, Skills, Interests */}
            <div className="md:col-span-2 space-y-6">
              {/* Bio Card */}
              <Card className="rounded-3xl border-border/60 shadow-sm">
                <CardHeader className="p-6 pb-2">
                  <CardTitle className="text-xl font-bold flex items-center gap-2.5">
                    <UserIcon className="h-5 w-5 text-primary" />
                    About {user.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-2">
                  {user.profile?.bio ? (
                    <p className="text-base text-foreground/90 whitespace-pre-line break-words leading-relaxed font-medium">
                      {user.profile.bio}
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-muted-foreground italic">
                      No bio provided yet.
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
                  {isOwner && (
                    <Link
                      href="/profile/edit"
                      className="text-sm font-bold text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-full"
                    >
                      Manage
                    </Link>
                  )}
                </CardHeader>
                <CardContent className="p-6 pt-4">
                  {user.skills.length === 0 ? (
                    <p className="text-sm font-medium text-muted-foreground italic">
                      No skills listed yet.
                    </p>
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
                      No interests listed yet.
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

            {/* Right Column: Academic Details */}
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

                  <div className="pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm">
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

          {/* Projects Portfolio Section */}
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

              {/* Only owner sees Add Project or Manage Projects buttons */}
              {isOwner && (
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/projects"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "default" }),
                      "rounded-full font-bold"
                    )}
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
              )}
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              {user.projects.length === 0 ? (
                <div className="rounded-3xl border border-dashed p-12 text-center space-y-3">
                  <FolderGit2 className="mx-auto h-12 w-12 text-muted-foreground/30" />
                  <p className="text-lg font-bold text-foreground">
                    No projects showcased yet.
                  </p>
                  <p className="text-sm font-medium text-muted-foreground max-w-md mx-auto">
                    This student hasn&apos;t added any portfolio projects to their profile yet.
                  </p>
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

                    const requiredSkills = project.skills
                      ?.filter(s => s.requirementType === 'REQUIRED')
                      .map(s => s.skill.name) || [];

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
                                {project.role}
                              </p>
                            )}

                            {project.description && (
                              <p className="text-sm font-medium text-muted-foreground line-clamp-2 leading-relaxed">
                                {project.description}
                              </p>
                            )}

                            {requiredSkills.length > 0 && (
                              <div className="pt-2 space-y-1.5">
                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Required Skills</span>
                                <p className="text-xs font-bold text-foreground/80 line-clamp-1 bg-muted/50 px-2 py-1 rounded-md inline-block">
                                  {requiredSkills.join(" • ")}
                                </p>
                              </div>
                            )}

                            {techList.length > 0 && requiredSkills.length === 0 && (
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

                          <div className="pt-4 mt-2 border-t border-border/50 flex items-center justify-between">
                            <Link
                              href={`/projects/${project.id}`}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-full transition-colors -ml-3"
                            >
                              Details <ArrowRight className="h-3.5 w-3.5" />
                            </Link>

                            <div className="flex items-center gap-3">
                              {project.githubUrl && (
                                <a
                                  href={project.githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground hover:text-foreground transition-colors"
                                  title="GitHub Repository"
                                >
                                  <GithubIcon className="h-5 w-5" />
                                </a>
                              )}
                              {project.liveUrl && (
                                <a
                                  href={project.liveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground hover:text-foreground transition-colors"
                                  title="Live Demo"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
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

