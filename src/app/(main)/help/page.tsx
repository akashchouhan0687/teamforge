import { Metadata } from "next";
import Link from "next/link";
import { User, Search, Users, CheckSquare, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Help Center | TeamForge",
  description: "Get help using TeamForge.",
};

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl min-h-[60vh]">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Help Center</h1>
        <p className="text-xl text-muted-foreground">Learn how to make the most of TeamForge.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Profile */}
        <div className="bg-card p-6 rounded-3xl border shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <User className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Your Profile</h2>
          </div>
          <p className="text-muted-foreground mb-4 flex-1">
            Your profile is your resume on TeamForge. Add your skills, academic details, and interests so the matching algorithm can pair you with the right projects.
          </p>
          <Link href="/profile/edit" className="text-primary font-bold hover:underline">Edit Profile &rarr;</Link>
        </div>

        {/* Discover */}
        <div className="bg-card p-6 rounded-3xl border shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Discover & Match</h2>
          </div>
          <p className="text-muted-foreground mb-4 flex-1">
            Browse other students and find teammates with complementary skills. Send connection requests to build your network before forming a team.
          </p>
          <Link href="/discover" className="text-primary font-bold hover:underline">Go to Discover &rarr;</Link>
        </div>

        {/* Teams */}
        <div className="bg-card p-6 rounded-3xl border shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Teams & Projects</h2>
          </div>
          <p className="text-muted-foreground mb-4 flex-1">
            Create a project and form a team, or join an existing one. Team owners can invite connections directly and manage the team's capacity and skill gaps.
          </p>
          <Link href="/teams" className="text-primary font-bold hover:underline">Manage Teams &rarr;</Link>
        </div>

        {/* Tasks */}
        <div className="bg-card p-6 rounded-3xl border shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <CheckSquare className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Tasks & Chat</h2>
          </div>
          <p className="text-muted-foreground mb-4 flex-1">
            Once inside a team, use the built-in Team Chat for real-time collaboration. Track your project progress using Team Tasks, assigned by the owner.
          </p>
          <Link href="/dashboard" className="text-primary font-bold hover:underline">View Dashboard &rarr;</Link>
        </div>

      </div>

      <div className="mt-12 bg-muted/30 rounded-3xl p-8 border border-border/50 text-center">
        <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Still need help?</h3>
        <p className="text-muted-foreground">
          Reach out to your course instructors or the student project maintainers for additional support.
        </p>
      </div>
    </div>
  );
}
