import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getAllSkills } from "@/lib/skills";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, PlusCircle } from "lucide-react";

export const metadata = {
  title: "Add New Project — TeamForge",
  description: "Add a project to your TeamForge student portfolio.",
};

export default async function NewProjectPage() {
  const session = await getSession();
  if (!session?.userId) {
    redirect("/login");
  }
  const availableSkills = await getAllSkills();

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-3xl space-y-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-card to-primary/5 rounded-3xl border border-primary/10 p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground flex items-center gap-3">
            Add New Project
          </h1>
          <p className="text-lg font-medium text-muted-foreground mt-3 max-w-xl">
            Share a project you created or contributed to with fellow students.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-border/50 bg-card shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-border/50 bg-muted/20">
          <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
            <PlusCircle className="h-6 w-6 text-primary" />
            Project Details
          </h2>
          <p className="text-muted-foreground font-medium mt-2">
            Provide information about your project, your role, and links to your code or live demo.
          </p>
        </div>
        <div className="p-6 md:p-8">
          <ProjectForm availableSkills={availableSkills} />
        </div>
      </div>
    </div>
  );
}
