import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { getAllSkills } from "@/lib/skills";
import { calculateProfileCompletion } from "@/lib/profile";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { SkillsManager } from "@/components/profile/SkillsManager";
import { ProfileCompletionBar } from "@/components/profile/ProfileCompletionBar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, User, Award } from "lucide-react";

export const metadata = {
  title: "Edit Profile — TeamForge",
  description: "Update your student profile details and manage your skills.",
};

export default async function EditProfilePage() {
  const session = await getSession();
  if (!session?.userId) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      profile: true,
      skills: {
        include: { skill: true },
        orderBy: { skill: { name: "asc" } },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const availableSkills = await getAllSkills();
  const completion = calculateProfileCompletion(user);

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-4xl space-y-10">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 bg-gradient-to-r from-card to-primary/5 rounded-3xl border border-primary/10 p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Edit Your Profile
          </h1>
          <p className="text-lg font-medium text-muted-foreground mt-2 max-w-xl">
            Complete your profile details to connect with peers and find teammates.
          </p>
        </div>

        <Link
          href="/profile"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "relative z-10 rounded-full font-bold shadow-sm shrink-0")}
        >
          View Public Profile
        </Link>
      </div>

      {/* Completion Indicator Card */}
      <div className="rounded-3xl border border-border/50 bg-card p-6 md:p-8 shadow-sm relative overflow-hidden">
        <ProfileCompletionBar completion={completion} />
      </div>

      {/* Profile Details Form Card */}
      <div className="rounded-3xl border border-border/50 bg-card shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-border/50 bg-muted/20">
          <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
            <User className="h-6 w-6 text-primary" />
            Personal & Academic Information
          </h2>
          <p className="text-muted-foreground font-medium mt-2">
            Update your basic details, academic year, department, and bio.
          </p>
        </div>
        <div className="p-6 md:p-8">
          <ProfileForm
            initialData={{
              name: user.name,
              department: user.profile?.department,
              year: user.profile?.year,
              bio: user.profile?.bio,
              location: user.profile?.location,
              profileImage: user.profile?.profileImage || user.image,
              interests: user.profile?.interests,
            }}
          />
        </div>
      </div>

      {/* Skills Manager Card */}
      <div className="rounded-3xl border border-border/50 bg-card shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-border/50 bg-muted/20">
          <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
            <Award className="h-6 w-6 text-primary" />
            Skills & Proficiencies
          </h2>
          <p className="text-muted-foreground font-medium mt-2">
            Showcase your technical and non-technical skills with proficiency levels.
          </p>
        </div>
        <div className="p-6 md:p-8">
          <SkillsManager
            availableSkills={availableSkills}
            userSkills={user.skills}
          />
        </div>
      </div>
    </div>
  );
}
