import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Guidelines | TeamForge",
  description: "Community guidelines for using TeamForge.",
};

export default function GuidelinesPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl min-h-[60vh]">
      <div className="bg-card rounded-3xl border shadow-sm p-8 md:p-12">
        <h1 className="text-4xl font-black mb-8">Community Guidelines</h1>
        
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p className="text-lg font-medium text-foreground">
            TeamForge is built to foster a productive, inclusive, and professional environment for student collaboration. By participating in this platform, you agree to uphold these standards.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Be Respectful</h2>
          <p>
            Treat all fellow students with respect. Harassment, discrimination, hate speech, and abusive language have no place on TeamForge. This applies to public profiles, project descriptions, and private team chats.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Maintain Accurate Profiles</h2>
          <p>
            The core of TeamForge is its skill-matching algorithm. Please accurately represent your skills, academic background, and interests. Do not claim proficiency in tools you have not used, as it disrupts the team formation process.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Collaborate Professionally</h2>
          <p>
            When you join a team, commit to the project. Communicate clearly with your teammates, update your assigned tasks on time, and contribute your fair share of the work. If you need to leave a team, notify your owner politely.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Respect Privacy and IP</h2>
          <p>
            Do not share your teammates' personal information or project code publicly without their explicit permission. Respect the intellectual property generated during your academic collaborations.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">5. No Spam</h2>
          <p>
            Do not spam connection requests or send unsolicited mass team invitations. Use the platform's Smart Suggestions and targeted discovery to build meaningful connections.
          </p>
        </div>
      </div>
    </div>
  );
}
