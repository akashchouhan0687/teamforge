import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | TeamForge",
  description: "Terms of service for TeamForge.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl min-h-[60vh]">
      <div className="bg-card rounded-3xl border shadow-sm p-8 md:p-12">
        <h1 className="text-4xl font-black mb-8">Terms of Service</h1>
        
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>
            <strong>Last Updated: {new Date().toLocaleDateString()}</strong>
          </p>

          <p>
            Welcome to TeamForge. By accessing and using our platform, you agree to these Terms of Service. Please read them carefully.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Student Project Disclaimer</h2>
          <p>
            TeamForge is provided &quot;as is&quot; as an educational/student project. While we strive to provide a stable platform for student collaboration, we make no legal guarantees regarding uptime, data retention, or the success of your academic projects formed through the platform.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. User Responsibilities</h2>
          <p>
            By using TeamForge, you agree to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide accurate representation of your academic status, skills, and identity.</li>
            <li>Use the platform respectfully and professionally when interacting with other students.</li>
            <li>Take responsibility for the content, code, or messages you share on the platform.</li>
            <li>Not use the platform for malicious purposes, spam, or harassment.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Content and Intellectual Property</h2>
          <p>
            You retain ownership of any project ideas, code, or materials you describe or upload to TeamForge. By posting content, you grant TeamForge a non-exclusive license to display that content to other users strictly for the purpose of operating the platform&apos;s networking and collaboration features.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Account Termination</h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate these terms, engage in abusive behavior, or disrupt the educational environment of the platform.
          </p>
        </div>
      </div>
    </div>
  );
}

