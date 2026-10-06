import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Briefcase, FolderGit2 } from "lucide-react";

export const metadata = {
  title: "My Projects — TeamForge",
  description: "Manage and showcase your projects on TeamForge.",
};

export default async function ProjectsPage() {
  const session = await getSession();
  if (!session?.userId) {
    redirect("/login");
  }

  const projects = await db.project.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      skills: {
        include: { skill: true }
      }
    }
  });

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-gradient-to-r from-card to-blue-500/5 rounded-3xl border border-blue-500/10 p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold uppercase tracking-wider">
            <FolderGit2 className="h-4 w-4" />
            <span>Portfolio</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            My Projects
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl font-medium">
            Showcase your work, team contributions, and technical projects.
          </p>
        </div>

        <Link
          href="/projects/new"
          className={cn(buttonVariants({ size: "default" }), "gap-2 shrink-0 rounded-full font-bold relative z-10 px-6 py-6")}
        >
          <Plus className="h-5 w-5" />
          Add Project
        </Link>
      </div>

      {/* Projects Grid or Empty State */}
      {projects.length === 0 ? (
        <div className="rounded-3xl border border-dashed bg-card p-12 text-center max-w-xl mx-auto space-y-6 my-12 shadow-sm relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary relative z-10">
            <Briefcase className="h-10 w-10" />
          </div>
          <div className="space-y-2 relative z-10">
            <h2 className="text-2xl font-black text-foreground">
              No projects added yet
            </h2>
            <p className="text-base font-medium text-muted-foreground leading-relaxed">
              Adding projects allows other students to see what you&apos;ve built, discover your technical stack, and invite you to hackathon teams.
            </p>
          </div>
          <div className="pt-4 relative z-10">
            <Link
              href="/projects/new"
              className={cn(buttonVariants({ size: "lg" }), "gap-2 rounded-full font-bold px-8")}
            >
              <Plus className="h-5 w-5" />
              Add Your First Project
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} isOwner={true} />
          ))}
        </div>
      )}
    </div>
  );
}
