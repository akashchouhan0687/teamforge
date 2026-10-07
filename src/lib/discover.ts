import { db } from "@/lib/db";
import { calculateProfileCompletion } from "@/lib/profile";

export interface DiscoverFilterParams {
  query?: string;
  department?: string;
  year?: string;
  skill?: string;
  interest?: string;
  page?: number;
  pageSize?: number;
  currentUserId?: string;
}

export interface DiscoveredStudentSkill {
  id: string;
  name: string;
  category: string | null;
  proficiency: string | null;
}

export interface DiscoveredStudent {
  id: string;
  name: string;
  image: string | null;
  department: string | null;
  year: string | null;
  bio: string | null;
  location: string | null;
  profileImage: string | null;
  interests: string[];
  skills: DiscoveredStudentSkill[];
  projectsCount: number;
  completeness: number;
  updatedAt: Date;
}

export interface DiscoverResult {
  students: DiscoveredStudent[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const DISCOVER_DEPARTMENTS = [
  { value: "CSE", label: "CSE (Computer Science)", match: ["CSE", "Computer Science", "Computer Engineering"] },
  { value: "IT", label: "IT (Information Tech)", match: ["IT", "Information Technology", "Software Engineering"] },
  { value: "ECE", label: "ECE (Electronics & Comm)", match: ["ECE", "Electronics", "Electrical"] },
  { value: "Mechanical", label: "Mechanical", match: ["Mechanical"] },
  { value: "Civil", label: "Civil", match: ["Civil"] },
  { value: "Other", label: "Other", match: ["Other", "Data Science", "Business", "Design", "Mathematics", "Physics"] },
] as const;

export const DISCOVER_YEARS = [
  { value: "1st Year", label: "1st Year (Freshman)", match: "1st Year" },
  { value: "2nd Year", label: "2nd Year (Sophomore)", match: "2nd Year" },
  { value: "3rd Year", label: "3rd Year (Junior)", match: "3rd Year" },
  { value: "4th Year", label: "4th Year (Senior)", match: "4th Year" },
] as const;

/**
 * Builds department Prisma query condition supporting acronyms and full department names.
 */
function buildDepartmentCondition(deptValue: string) {
  const trimmed = deptValue.trim();
  const known = DISCOVER_DEPARTMENTS.find(
    (d) => d.value.toLowerCase() === trimmed.toLowerCase()
  );

  if (known) {
    return {
      OR: known.match.map((term) => ({
        profile: {
          department: {
            contains: term,
          },
        },
      })),
    };
  }

  // Fallback direct contains
  return {
    profile: {
      department: {
        contains: trimmed,
      },
    },
  };
}

/**
 * Retrieves discoverable students matching search and filter criteria.
 * Securely omits passwords, emails, and sensitive user account data.
 * Applies deterministic ranking: relevance -> profile completeness -> recency.
 */
export async function getDiscoveredStudents({
  query,
  department,
  year,
  skill,
  interest,
  page = 1,
  pageSize = 12,
  currentUserId,
}: DiscoverFilterParams): Promise<DiscoverResult> {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.max(1, Math.min(50, Number(pageSize) || 12));

  // Build Prisma where conditions
  const andConditions: any[] = [];

  if (currentUserId) {
    andConditions.push({ id: { not: currentUserId } });
  }

  // 1. Text Search across Name, Skills, and Profile Interests
  if (query && query.trim().length > 0) {
    const q = query.trim();
    andConditions.push({
      OR: [
        { name: { contains: q } },
        {
          skills: {
            some: {
              skill: {
                name: { contains: q },
              },
            },
          },
        },
        {
          profile: {
            interests: { contains: q },
          },
        },
        {
          profile: {
            bio: { contains: q },
          },
        },
      ],
    });
  }

  // 2. Department filter
  if (department && department.trim().length > 0 && department !== "all") {
    andConditions.push(buildDepartmentCondition(department.trim()));
  }

  // 3. Year filter
  if (year && year.trim().length > 0 && year !== "all") {
    const trimmedYear = year.trim();
    const knownYear = DISCOVER_YEARS.find(
      (y) => y.value.toLowerCase() === trimmedYear.toLowerCase()
    );
    const matchTerm = knownYear ? knownYear.match : trimmedYear;

    andConditions.push({
      profile: {
        year: { contains: matchTerm },
      },
    });
  }

  // 4. Skill filter
  if (skill && skill.trim().length > 0 && skill !== "all") {
    andConditions.push({
      skills: {
        some: {
          skill: {
            name: { contains: skill.trim() },
          },
        },
      },
    });
  }

  // 5. Interest filter
  if (interest && interest.trim().length > 0) {
    andConditions.push({
      profile: {
        interests: { contains: interest.trim() },
      },
    });
  }

  const whereClause = andConditions.length > 0 ? { AND: andConditions } : {};

  // Fetch users with secure projection
  const users = await db.user.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      image: true,
      updatedAt: true,
      profile: {
        select: {
          department: true,
          year: true,
          bio: true,
          location: true,
          profileImage: true,
          interests: true,
          updatedAt: true,
        },
      },
      skills: {
        select: {
          proficiency: true,
          skill: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
        },
        orderBy: { skill: { name: "asc" } },
      },
      _count: {
        select: {
          projects: true,
        },
      },
    },
  });

  // Calculate completeness and rank deterministically
  const qLower = query ? query.trim().toLowerCase() : "";

  const scoredStudents: (DiscoveredStudent & { score: number })[] = users.map(
    (user) => {
      const completion = calculateProfileCompletion(user);

      // Parse comma-separated interests
      const interestsList = user.profile?.interests
        ? user.profile.interests
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean)
        : [];

      const formattedSkills: DiscoveredStudentSkill[] = user.skills.map((s) => ({
        id: s.skill.id,
        name: s.skill.name,
        category: s.skill.category,
        proficiency: s.proficiency,
      }));

      // Deterministic relevance score
      let score = 0;

      if (qLower) {
        const nameLower = user.name.toLowerCase();
        if (nameLower === qLower) {
          score += 100; // Exact name match
        } else if (nameLower.startsWith(qLower)) {
          score += 60; // Name starts with query
        } else if (nameLower.includes(qLower)) {
          score += 40; // Name contains query
        }

        // Skill matching score
        for (const s of formattedSkills) {
          const sLower = s.name.toLowerCase();
          if (sLower === qLower) {
            score += 50;
            if (s.proficiency === "Advanced") score += 15;
            else if (s.proficiency === "Intermediate") score += 10;
          } else if (sLower.includes(qLower)) {
            score += 25;
          }
        }

        // Interests matching score
        for (const intr of interestsList) {
          const intrLower = intr.toLowerCase();
          if (intrLower.includes(qLower)) {
            score += 30;
          }
        }
      }

      // Profile completeness factor (up to 20 points bonus)
      score += Math.round((completion.percentage / 100) * 20);

      // Projects count factor (up to 10 points bonus)
      score += Math.min(10, user._count.projects * 3);

      return {
        id: user.id,
        name: user.name,
        image: user.image,
        department: user.profile?.department || null,
        year: user.profile?.year || null,
        bio: user.profile?.bio || null,
        location: user.profile?.location || null,
        profileImage: user.profile?.profileImage || null,
        interests: interestsList,
        skills: formattedSkills,
        projectsCount: user._count.projects,
        completeness: completion.percentage,
        updatedAt: user.profile?.updatedAt || user.updatedAt,
        score,
      };
    }
  );

  // Deterministic Sorting:
  // 1. Relevance score descending
  // 2. Profile completeness descending
  // 3. Recently updated descending
  scoredStudents.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    if (b.completeness !== a.completeness) {
      return b.completeness - a.completeness;
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const totalCount = scoredStudents.length;
  const totalPages = Math.ceil(totalCount / safePageSize) || 1;
  const startIndex = (safePage - 1) * safePageSize;
  const paginatedStudents = scoredStudents.slice(
    startIndex,
    startIndex + safePageSize
  );

  return {
    students: paginatedStudents.map(({ score, ...rest }) => rest),
    totalCount,
    totalPages,
    currentPage: safePage,
    pageSize: safePageSize,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
  };
}


