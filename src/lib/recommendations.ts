/**
 * Recommendations module — wraps the matching engine with DB queries.
 *
 * Fetches profiles from the database and returns the top-N most
 * compatible students for the current user, sorted by overall score.
 */
import "server-only";
import { db } from "@/lib/db";
import { matchProfiles, MatchResult, ProfileInput } from "@/lib/matching";

// ──────────────────────────────────────────────────────────────
// DB query helpers
// ──────────────────────────────────────────────────────────────

interface RawUserWithProfile {
  id: string;
  name: string;
  image: string | null;
  profile: {
    department: string | null;
    year: string | null;
    interests: string | null;
    availability: string | null;
    profileImage: string | null;
  } | null;
  skills: {
    skillId: string;
    proficiency: string | null;
    skill: {
      id: string;
      name: string;
    };
  }[];
}

function parseInterests(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean);
}

function toProfileInput(user: RawUserWithProfile): ProfileInput {
  return {
    id: user.id,
    department: user.profile?.department ?? null,
    year: user.profile?.year ?? null,
    interests: parseInterests(user.profile?.interests),
    availability: user.profile?.availability ?? null,
    skills: user.skills.map((us) => ({
      id: us.skill.id,
      name: us.skill.name,
      proficiency: us.proficiency,
    })),
  };
}

const USER_SELECT = {
  id: true,
  name: true,
  image: true,
  profile: {
    select: {
      department: true,
      year: true,
      interests: true,
      availability: true,
      profileImage: true,
    },
  },
  skills: {
    select: {
      skillId: true,
      proficiency: true,
      skill: {
        select: { id: true, name: true },
      },
    },
  },
} as const;

// ──────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────

/**
 * Returns the top `limit` students most compatible with `currentUserId`.
 *
 * - Skips users with overallScore < 10 (essentially no overlap)
 * - Skips users with no profile or no skills
 * - Sorted descending by overallScore
 */
export async function getRecommendedStudents(
  currentUserId: string,
  limit = 6
): Promise<MatchResult[]> {
  // Fetch current user
  const currentUser = await db.user.findUnique({
    where: { id: currentUserId },
    select: USER_SELECT,
  });

  if (!currentUser) return [];

  // Require at least some profile data to generate meaningful matches
  const currentProfile = toProfileInput(currentUser);
  const hasEnoughData =
    currentProfile.skills.length > 0 || currentProfile.interests.length > 0;
  if (!hasEnoughData) return [];

  // Fetch all other users (who have at least a profile)
  const otherUsers = await db.user.findMany({
    where: {
      id: { not: currentUserId },
      profile: { isNot: null },
    },
    select: USER_SELECT,
  });

  // Score each candidate
  const results: MatchResult[] = [];

  for (const candidate of otherUsers) {
    // Skip users with no profile data
    if (!candidate.profile) continue;

    const candidateProfile = toProfileInput(candidate);

    const result = matchProfiles(currentProfile, candidateProfile, {
      name: candidate.name,
      image: candidate.image,
      profileImage: candidate.profile?.profileImage ?? null,
    });

    // Filter out very low matches (noise)
    if (result.overallScore >= 10) {
      results.push(result);
    }
  }

  // Sort by score descending, then name ascending for determinism
  results.sort((a, b) => {
    if (b.overallScore !== a.overallScore) {
      return b.overallScore - a.overallScore;
    }
    return a.targetName.localeCompare(b.targetName);
  });

  return results.slice(0, limit);
}
