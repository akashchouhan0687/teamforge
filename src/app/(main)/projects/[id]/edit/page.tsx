import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { getAllSkills } from "@/lib/skills";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Edit3 } from "lucide-react";

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit Project — TeamForge",
  description: "Update your project portfolio details.",
};

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  const { id } = await params;
  const session = await getSession();

  if (!session?.userId) {
    redirect("/login");
  }

  const project = await db.project.findUnique({
    where: { id },
    include: {
      skills: {
        include: { skill: true }
      }
    }
  });

  if (!project) {
    notFound();
  }

  // Authorization check: Only the owner can access the edit page
  if (project.userId !== session.userId) {
    redirect("/projects");
  }

  const availableSkills = await getAllSkills();

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-3xl space-y-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-card to-primary/5 rounded-3xl border border-primary/10 p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Project Details
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Edit Project
          </h1>
          <p className="text-lg font-medium text-muted-foreground mt-3 max-w-xl line-clamp-1">
            Make updates to &ldquo;{project.title}&rdquo;.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-border/50 bg-card shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-border/50 bg-muted/20">
          <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
            <Edit3 className="h-6 w-6 text-primary" />
            Project Details
          </h2>
          <p className="text-muted-foreground font-medium mt-2">
            Update your project title, description, technologies, or repository links.
          </p>
        </div>
        <div className="p-6 md:p-8">
          <ProjectForm
            availableSkills={availableSkills}
            initialData={{
              id: project.id,
              title: project.title,
              description: project.description,
              role: project.role,
              technologies: project.technologies,
              githubUrl: project.githubUrl,
              liveUrl: project.liveUrl,
              imageUrl: project.imageUrl || project.image,
              projectType: project.projectType,
              teamSize: project.teamSize,
              requiredSkills: project.skills.filter(s => s.requirementType === 'REQUIRED').map(s => s.skillId),
              preferredSkills: project.skills.filter(s => s.requirementType === 'PREFERRED').map(s => s.skillId),
            }}
          />
        </div>
      </div>
    </div>
  );
}
