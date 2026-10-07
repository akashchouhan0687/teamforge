import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | TeamForge",
  description: "Privacy policy for TeamForge.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl min-h-[60vh]">
      <div className="bg-card rounded-3xl border shadow-sm p-8 md:p-12">
        <h1 className="text-4xl font-black mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>
            <strong>Last Updated: {new Date().toLocaleDateString()}</strong>
          </p>

          <p>
            Welcome to TeamForge! This is a student project platform designed to help students connect, form teams, and collaborate on projects. We take your privacy seriously and strive to collect only what is necessary for the platform to function.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Information We Collect</h2>
          <p>
            We collect the information you voluntarily provide when creating an account, filling out your profile, and using the platform. This includes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Basic account information (name, email)</li>
            <li>Profile details (academic year, department, bio)</li>
            <li>Skills, projects, and interests you choose to display</li>
            <li>Messages and content you share within team chats and tasks</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. How We Use Your Information</h2>
          <p>
            Your information is used strictly to power the TeamForge features:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To display your profile to other students for networking and team formation.</li>
            <li>To match you with potential projects and teams based on your skills.</li>
            <li>To facilitate communication within teams.</li>
            <li>To send you notifications about connection requests and invitations.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Data Sharing and Security</h2>
          <p>
            As a student project, TeamForge is not a commercial entity. We do not sell your personal data to third parties. Your public profile information is visible to other authenticated users on the platform to facilitate collaboration. We use standard industry practices for data storage, but as an academic/student project, we do not claim formal compliance certifications.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Your Control</h2>
          <p>
            You can edit your profile information at any time from your account settings. If you wish to have your account removed from our database, please contact the platform administrators.
          </p>
        </div>
      </div>
    </div>
  );
}
