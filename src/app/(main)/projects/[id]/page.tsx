import { notFound } from "next/navigation";
import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { DeleteProjectButton } from "@/components/projects/DeleteProjectButton";
import { GithubIcon } from "@/components/icons/GithubIcon";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ExternalLink,
  Edit3,
  Calendar,
  User,
  Layers,
  Code2,
} from "lucide-react";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const project = await db.project.findUnique({
    where: { id },
    select: { title: true, description: true },
  });

  if (!project) return { title: "Project Not Found — TeamForge" };

  return {
    title: `${project.title} — TeamForge`,
    description: project.description?.slice(0, 160) || "Student project on TeamForge",
  };
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { id } = await params;
  const session = await getSession();

  const project = await db.project.findUnique({
    where: { id },
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
            },
          },
        },
      },
      skills: {
        include: { skill: true }
      },
      team: {
        include: {
          members: true,
        }
      }
    },
  });

  if (!project) {
    notFound();
  }

  const isOwner = session?.userId === project.userId;
  const image = project.imageUrl || project.image;

  const techList = project.technologies
    ? project.technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-4xl space-y-8">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        {isOwner && (
          <div className="flex items-center gap-2">
            <Link
              href={`/projects/${project.id}/edit`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5"
              )}
            >
              <Edit3 className="h-4 w-4" />
              Edit Project
            </Link>
            <DeleteProjectButton
              projectId={project.id}
              projectTitle={project.title}
            />
          </div>
        )}
      </div>

      {/* Main Project Card */}
      <div className="rounded-3xl border bg-card shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none z-0" />

        {/* Large Image Header */}
        {image ? (
          <div className="relative w-full h-64 md:h-96 bg-muted/60 border-b border-border/50 overflow-hidden flex items-center justify-center z-10">
            <SafeImage src={image} alt={project.title} className="object-cover" fill priority sizes="100vw" />
          </div>
        ) : (
          <div className="relative w-full h-48 md:h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-b border-border/50 flex flex-col items-center justify-center text-muted-foreground/50 z-10 gap-3">
            <Code2 className="h-16 w-16 md:h-20 md:w-20 text-primary/20" />
            <span className="text-xs font-black uppercase tracking-widest text-primary/40">Project Showcase</span>
          </div>
        )}

        <div className="p-8 md:p-10 space-y-8 relative z-10">
          {/* Title & Metadata */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {project.role && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20">
                  <User className="h-3 w-3" />
                  {project.role}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <Calendar className="h-3.5 w-3.5" />
                Created{" "}
                {project.createdAt.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              {project.title}
            </h1>

            {/* Author Link */}
            <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground font-medium">
              <span>By</span>
              <span className="font-bold text-foreground">
                {project.user.name}
              </span>
              {project.user.profile?.department && (
                <>
                  <span className="text-muted-foreground/40">•</span>
                  <span>{project.user.profile.department}</span>
                </>
              )}
            </div>
          </div>

          {/* Action Links: GitHub & Live Demo */}
          {(project.githubUrl || project.liveUrl) && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "gap-2 rounded-full font-bold px-6"
                  )}
                >
                  <GithubIcon className="h-5 w-5" />
                  GitHub Repository
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "gap-2 rounded-full font-bold px-6"
                  )}
                >
                  <ExternalLink className="h-5 w-5" />
                  View Live Demo
                </a>
              )}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-8 pt-6 border-t border-border/50">
            {/* Left Col: Description */}
            <div className="md:col-span-2 space-y-8">
              {/* Description */}
              <div className="space-y-3">
                <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                  About this Project
                </h2>
                <div className="text-base text-foreground/90 leading-relaxed whitespace-pre-line break-words font-medium bg-muted/30 p-6 rounded-3xl border border-border/50">
                  {project.description}
                </div>
              </div>

              {/* Technologies Section */}
              {techList.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xs font-black tracking-widest uppercase text-muted-foreground flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-primary" />
                    Technologies & Tools
                  </h2>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {techList.map((tech) => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="px-4 py-1.5 text-sm font-bold bg-muted/60"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Col: Requirements & Team */}
            <div className="space-y-8 bg-muted/10 p-6 rounded-3xl border border-border/50">
              {/* Project Requirements */}
              <div className="space-y-6">
                <h2 className="text-xs font-black tracking-widest uppercase text-muted-foreground flex items-center gap-1.5 border-b border-border/50 pb-2">
                  Project Requirements
                </h2>
                
                <div className="space-y-5">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-foreground/70 tracking-wider">Required Skills</span>
                    <div className="flex flex-wrap gap-2">
                      {project.skills.filter(s => s.requirementType === 'REQUIRED').length > 0 ? (
                        project.skills.filter(s => s.requirementType === 'REQUIRED').map(s => (
                          <Badge key={s.skillId} variant="default" className="text-xs px-2.5 py-1">
                            {s.skill.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs font-medium text-muted-foreground italic">None specified</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-foreground/70 tracking-wider">Preferred Skills</span>
                    <div className="flex flex-wrap gap-2">
                      {project.skills.filter(s => s.requirementType === 'PREFERRED').length > 0 ? (
                        project.skills.filter(s => s.requirementType === 'PREFERRED').map(s => (
                          <Badge key={s.skillId} variant="secondary" className="text-xs px-2.5 py-1 bg-background">
                            {s.skill.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs font-medium text-muted-foreground italic">None specified</span>
                      )}
                    </div>
                  </div>

                  {(project.teamSize || project.projectType) && (
                    <div className="flex flex-wrap gap-6 pt-2 border-t border-border/50">
                      {project.teamSize && (
                        <div className="space-y-1 mt-2">
                          <span className="text-[10px] font-black uppercase text-foreground/70 tracking-wider block">Team Size</span>
                          <span className="text-sm font-bold text-foreground block">{project.teamSize} members</span>
                        </div>
                      )}
                      {project.projectType && (
                        <div className="space-y-1 mt-2">
                          <span className="text-[10px] font-black uppercase text-foreground/70 tracking-wider block">Project Type</span>
                          <span className="text-sm font-bold text-foreground block">{project.projectType}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {project.skills.length === 0 && !project.teamSize && !project.projectType && (
                  <p className="text-sm font-medium text-muted-foreground italic pt-1">
                    No skill requirements added yet.
                  </p>
                )}
              </div>

              {/* Team Section */}
              <div className="space-y-4 pt-6 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black tracking-widest uppercase text-muted-foreground flex items-center gap-1.5">
                    <User className="h-4 w-4 text-primary" />
                    Team
                  </h2>
                  {project.team ? (
                    <Link
                      href={`/teams/${project.team.id}`}
                      className={cn(buttonVariants({ size: "sm" }), "rounded-full font-bold")}
                    >
                      View Team
                    </Link>
                  ) : (
                    isOwner && (
                      <form action={async () => {
                        "use server";
                        const { createTeam } = await import("@/app/actions/teams");
                        // We can just construct a dummy formData or update createTeam
                        const formData = new FormData();
                        formData.append("name", `${project.title} Team`);
                        await createTeam(project.id, formData);
                      }}>
                        <button
                          type="submit"
                          className={cn(buttonVariants({ size: "sm" }), "rounded-full font-bold")}
                        >
                          Create Team
                        </button>
                      </form>
                    )
                  )}
                </div>
                
                {project.team ? (
                  <div className="text-sm font-medium text-muted-foreground bg-background p-4 rounded-2xl border">
                    <p>This project has an active team.</p>
                    <p className="mt-1">
                      <span className="font-bold text-foreground">{project.team.members.length}</span> member{project.team.members.length === 1 ? "" : "s"}
                      {project.teamSize && ` (out of ${project.teamSize} max)`}
                    </p>
                  </div>
                ) : (
                  <div className="text-sm font-medium text-muted-foreground bg-background p-4 rounded-2xl border border-dashed">
                    <p>No team has been formed for this project yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

