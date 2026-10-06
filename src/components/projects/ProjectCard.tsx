import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { DeleteProjectButton } from "@/components/projects/DeleteProjectButton";
import { GithubIcon } from "@/components/icons/GithubIcon";
import { cn } from "@/lib/utils";
import { ExternalLink, Code2, User, Eye, Edit3 } from "lucide-react";

export interface ProjectData {
  id: string;
  title: string;
  description?: string | null;
  role?: string | null;
  technologies?: string | null;
  githubUrl?: string | null;
  liveUrl?: string | null;
  imageUrl?: string | null;
  image?: string | null;
  userId: string;
  skills?: {
    skillId: string;
    requirementType: string;
    skill: {
      name: string;
    };
  }[];
}

interface ProjectCardProps {
  project: ProjectData;
  isOwner?: boolean;
}

export function ProjectCard({ project, isOwner = false }: ProjectCardProps) {
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
    <div className="group rounded-3xl border bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/40 hover:-translate-y-1 flex flex-col overflow-hidden relative">
      {/* Decorative hover gradient */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none z-0" />

      {/* Project Image / Visual Header */}
      <div className="relative h-48 w-full bg-muted/60 overflow-hidden border-b border-border/50 flex items-center justify-center z-10">
        {image ? (
          <>
            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors z-10" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={project.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </>
        ) : (
          <div className="flex h-full w-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 items-center justify-center flex-col text-muted-foreground/60 gap-2 p-4 text-center">
            <Code2 className="h-12 w-12 text-primary/30 group-hover:scale-110 transition-transform duration-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary/50">Showcase</span>
          </div>
        )}

        {/* Role badge overlay if provided */}
        {project.role && (
          <div className="absolute top-4 left-4 z-20">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-background/95 backdrop-blur-md px-3 py-1.5 text-xs font-black uppercase tracking-wider text-primary shadow-sm border border-border/50">
              <User className="h-3.5 w-3.5" />
              {project.role}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4 relative z-10 bg-card">
        <div className="space-y-3">
          <Link
            href={`/projects/${project.id}`}
            className="font-black text-xl text-foreground hover:text-primary transition-colors line-clamp-1 block group-hover:text-primary"
          >
            {project.title}
          </Link>

          {project.description && (
            <p className="text-sm font-medium text-muted-foreground line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}

          {/* Project Requirements (Required Skills) */}
          {requiredSkills.length > 0 && (
            <div className="pt-2 space-y-1.5">
              <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest block">Required Skills</span>
              <p className="text-xs font-bold text-foreground/80 line-clamp-1 bg-muted/50 px-2 py-1 rounded-md inline-block">
                {requiredSkills.join(" • ")}
              </p>
            </div>
          )}

          {/* Technologies */}
          {techList.length > 0 && requiredSkills.length === 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {techList.slice(0, 4).map((tech) => (
                <Badge
                  key={tech}
                  variant="secondary"
                  className="px-2.5 py-0.5 text-[11px] font-bold bg-muted/60"
                >
                  {tech}
                </Badge>
              ))}
              {techList.length > 4 && (
                <span className="text-[11px] font-bold text-muted-foreground self-center pl-1">
                  +{techList.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Links & Actions Footer */}
        <div className="pt-5 mt-2 border-t border-border/50 flex items-center justify-between gap-3">
          {/* External links */}
          <div className="flex items-center gap-3">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="View GitHub Repository"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <GithubIcon className="h-5 w-5" />
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="View Live Demo"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>

          {/* Actions: View / Edit / Delete */}
          <div className="flex items-center gap-2">
            <Link
              href={`/projects/${project.id}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-9 rounded-full px-4 text-xs font-bold gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-colors"
              )}
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">View</span>
            </Link>

            {isOwner && (
              <>
                <Link
                  href={`/projects/${project.id}/edit`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "h-9 rounded-full px-4 text-xs font-bold gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-colors"
                  )}
                  title="Edit Project"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </Link>

                <DeleteProjectButton
                  projectId={project.id}
                  projectTitle={project.title}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
