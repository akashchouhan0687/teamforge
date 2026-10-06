import Link from "next/link";
import { getAllSkills } from "@/lib/skills";
import { getDiscoveredStudents } from "@/lib/discover";
import { getRecommendedStudents } from "@/lib/recommendations";
import { getSession } from "@/lib/session";
import { StudentCard } from "@/components/discover/StudentCard";
import { MatchCard } from "@/components/discover/MatchCard";
import { DiscoverFilters } from "@/components/discover/DiscoverFilters";
import { DiscoverPagination } from "@/components/discover/DiscoverPagination";
import { buttonVariants } from "@/components/ui/button";
import { Users, SearchX, Sparkles, UserPlus, Zap } from "lucide-react";

export const metadata = {
  title: "Discover Students — TeamForge",
  description:
    "Find students with the skills and interests you're looking for. Search by name, programming languages, department, and academic year.",
};

interface DiscoverPageProps {
  searchParams: Promise<{
    q?: string;
    department?: string;
    year?: string;
    skill?: string;
    interest?: string;
    page?: string;
  }>;
}

export default async function DiscoverPage({
  searchParams,
}: DiscoverPageProps) {
  const params = await searchParams;

  const q = typeof params.q === "string" ? params.q.trim() : undefined;
  const department =
    typeof params.department === "string" ? params.department.trim() : undefined;
  const year =
    typeof params.year === "string" ? params.year.trim() : undefined;
  const skill =
    typeof params.skill === "string" ? params.skill.trim() : undefined;
  const interest =
    typeof params.interest === "string" ? params.interest.trim() : undefined;
  const page = typeof params.page === "string" ? parseInt(params.page, 10) : 1;

  // Get current session for personalized recommendations
  const session = await getSession();
  const currentUserId = session?.userId ?? null;

  // Concurrent queries — recommendations only when logged in
  const [availableSkills, result, recommendations] = await Promise.all([
    getAllSkills(),
    getDiscoveredStudents({
      query: q,
      department,
      year,
      skill,
      interest,
      page: isNaN(page) ? 1 : page,
      pageSize: 12,
    }),
    currentUserId ? getRecommendedStudents(currentUserId, 6) : Promise.resolve([]),
  ]);

  const hasActiveFilters = Boolean(
    q ||
      (department && department !== "all") ||
      (year && year !== "all") ||
      (skill && skill !== "all") ||
      interest
  );

  // Construct query string for pagination preserving search params
  const currentParams = new URLSearchParams();
  if (q) currentParams.set("q", q);
  if (department && department !== "all") currentParams.set("department", department);
  if (year && year !== "all") currentParams.set("year", year);
  if (skill && skill !== "all") currentParams.set("skill", skill);
  if (interest) currentParams.set("interest", interest);
  const baseUrl = `/discover?${currentParams.toString()}`;

  // Only show recommendations section if user is logged in and has results
  const showRecommendations = currentUserId && recommendations.length > 0;

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 max-w-7xl space-y-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-gradient-to-r from-card to-primary/5 rounded-3xl border border-primary/10 p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <Users className="h-4 w-4" />
            <span>Student Directory</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Discover Students
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl font-medium">
            Find the right people for your next project based on skills, year, and department.
          </p>
        </div>

        <div className="text-sm font-bold bg-background/80 backdrop-blur px-4 py-2 rounded-full border shadow-sm self-start md:self-end relative z-10">
          <span className="text-primary">
            {result.totalCount}
          </span>{" "}
          {result.totalCount === 1 ? "student" : "students"} available
        </div>
      </div>

      {/* Recommended for You — only for logged-in users */}
      {showRecommendations && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Recommended for You
                </h2>
              </div>
              <p className="text-xs text-muted-foreground pl-9">
                Students with complementary skills and shared interests — ranked by compatibility.
              </p>
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">
              Based on your profile
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((match) => (
              <MatchCard key={match.targetUserId} match={match} />
            ))}
          </div>
        </section>
      )}

      {/* Filter and Search Bar */}
      <section className="space-y-4">
        {showRecommendations && (
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Browse All Students
            </div>
            <div className="h-px flex-1 bg-border" />
          </div>
        )}

        <DiscoverFilters
          initialQuery={q || ""}
          initialDepartment={department || ""}
          initialYear={year || ""}
          initialSkill={skill || ""}
          availableSkills={availableSkills.map((s) => ({
            id: s.id,
            name: s.name,
          }))}
        />
      </section>

      {/* Students Results Grid */}
      {result.students.length > 0 ? (
        <div className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {result.students.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>

          {/* Server-Side Pagination */}
          <DiscoverPagination
            currentPage={result.currentPage}
            totalPages={result.totalPages}
            totalCount={result.totalCount}
            pageSize={result.pageSize}
            baseUrl={baseUrl}
          />
        </div>
      ) : (
        /* Empty States */
        <div className="rounded-2xl border border-dashed bg-card/50 p-12 text-center max-w-2xl mx-auto space-y-4 my-8">
          {hasActiveFilters ? (
            <>
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <SearchX className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">
                  No students found.
                </h3>
                <p className="text-sm text-muted-foreground">
                  Try changing your search or filters to discover students.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/discover"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Clear All Filters
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                <UserPlus className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">
                  No students in the directory yet.
                </h3>
                <p className="text-sm text-muted-foreground">
                  Be among the first students to set up your profile and showcase your skills!
                </p>
              </div>
              <div className="pt-2">
                <Link href="/register" className={buttonVariants({ size: "sm" })}>
                  Create Your Profile
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
