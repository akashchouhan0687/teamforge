/**
 * TeamForge — Core Matching Engine
 *
 * Deterministic, rule-based, explainable scoring system.
 * Generic enough to be reused for:
 *   - Student ↔ Student compatibility
 *   - Student ↔ Project requirements (future)
 *   - Team skill-gap analysis (future)
 *   - Candidate recommendations (future)
 *
 * Score breakdown (total: 100 pts):
 *   - Complementary skills : 40 pts
 *   - Shared interests      : 20 pts
 *   - Common skills         : 10 pts
 *   - Department compat.    : 10 pts
 *   - Year proximity        : 5 pts
 *   - Availability overlap  : 15 pts
 */

// ──────────────────────────────────────────────────────────────
// Input types
// ──────────────────────────────────────────────────────────────

export interface SkillInput {
  id: string;
  name: string;
  proficiency?: string | null;
}

export interface ProfileInput {
  /** The owning user's ID */
  id: string;
  department?: string | null;
  year?: string | null;
  /** Already parsed from comma-separated string */
  interests: string[];
  /** Free-text string, e.g. "Open to collaboration, part-time" */
  availability?: string | null;
  skills: SkillInput[];
}

// ──────────────────────────────────────────────────────────────
// Output types
// ──────────────────────────────────────────────────────────────

export interface MatchScoreBreakdown {
  /** max 40 — skills one person has that the other doesn't */
  complementarySkillsScore: number;
  /** max 20 — shared interest topics */
  sharedInterestsScore: number;
  /** max 10 — skills both already share */
  commonSkillsScore: number;
  /** max 10 — same/related academic department */
  departmentScore: number;
  /** max 5 — academic year proximity */
  yearScore: number;
  /** max 15 — overlapping availability keywords */
  availabilityScore: number;
  /** 0–100 integer */
  overallScore: number;
}

export interface MatchResult {
  targetUserId: string;
  targetName: string;
  targetImage: string | null;
  targetProfileImage: string | null;
  targetDepartment: string | null;
  targetYear: string | null;
  targetSkills: SkillInput[];
  targetInterests: string[];
  scoreBreakdown: MatchScoreBreakdown;
  /** 0–100 integer — convenience alias for scoreBreakdown.overallScore */
  overallScore: number;
  /** Skill names both profiles share */
  commonSkills: string[];
  /** Skills unique to A + skills unique to B (the complementary pool) */
  complementarySkills: string[];
  /** Interest topics both profiles share */
  sharedInterests: string[];
  /** Human-readable reasons — only included when genuinely supported by data */
  reasons: string[];
}

// ──────────────────────────────────────────────────────────────
// Department groupings for partial compatibility
// ──────────────────────────────────────────────────────────────

const DEPARTMENT_GROUPS: string[][] = [
  [
    "Computer Science",
    "Computer Engineering",
    "Software Engineering",
    "Information Technology",
  ],
  ["Data Science", "Mathematics", "Statistics"],
  ["Electrical Engineering", "Electronics", "ECE"],
  ["Mechanical Engineering", "Mechanical"],
  ["Civil Engineering", "Civil"],
  ["Business & Management", "Business", "Management"],
  ["Design & Media", "Design", "Media"],
  ["Physics"],
  ["Other"],
];

// ──────────────────────────────────────────────────────────────
// Academic year → numeric rank for proximity calc
// ──────────────────────────────────────────────────────────────

function yearToNumber(year: string | null | undefined): number | null {
  if (!year) return null;
  const lower = year.toLowerCase();
  if (lower.includes("1st") || lower.includes("freshman")) return 1;
  if (lower.includes("2nd") || lower.includes("sophomore")) return 2;
  if (lower.includes("3rd") || lower.includes("junior")) return 3;
  if (lower.includes("4th") || lower.includes("senior")) return 4;
  if (lower.includes("graduate") || lower.includes("master")) return 5;
  if (lower.includes("phd") || lower.includes("doctoral")) return 6;
  if (lower.includes("alumni")) return 7;
  return null;
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

function normalizeSkillName(name: string): string {
  return name.toLowerCase().trim();
}

function normalizeTerm(term: string): string {
  return term.toLowerCase().trim();
}

const normalizedSkillsCache = new WeakMap<SkillInput[], Set<string>>();
function getNormalizedSkillSet(skills: SkillInput[]): Set<string> {
  if (normalizedSkillsCache.has(skills)) return normalizedSkillsCache.get(skills)!;
  const set = new Set(skills.map((s) => normalizeSkillName(s.name)));
  normalizedSkillsCache.set(skills, set);
  return set;
}

function getDeptGroup(dept: string | null | undefined): string[] | null {
  if (!dept) return null;
  const normalized = dept.trim().toLowerCase();
  for (const group of DEPARTMENT_GROUPS) {
    if (group.some((g) => g.toLowerCase() === normalized)) {
      return group;
    }
  }
  return null;
}

// ──────────────────────────────────────────────────────────────
// Core scoring functions
// ──────────────────────────────────────────────────────────────

/**
 * Complementary skills (max 40)
 *
 * Counts skills each person has that the other doesn't.
 * A high complementary count means the pair covers more ground together.
 */
function scoreComplementarySkills(
  skillsA: SkillInput[],
  skillsB: SkillInput[]
): {
  score: number;
  uniqueToA: string[];
  uniqueToB: string[];
  common: string[];
} {
  const setA = getNormalizedSkillSet(skillsA);
  const setB = getNormalizedSkillSet(skillsB);

  const uniqueToA: string[] = [];
  const uniqueToB: string[] = [];
  const common: string[] = [];

  for (const s of setA) {
    if (setB.has(s)) {
      common.push(s);
    } else {
      uniqueToA.push(s);
    }
  }
  for (const s of setB) {
    if (!setA.has(s)) {
      uniqueToB.push(s);
    }
  }

  const complementaryCount = uniqueToA.length + uniqueToB.length;
  const totalUnique = new Set([...setA, ...setB]).size;

  // Ratio of complementary coverage among all distinct skills
  const score =
    totalUnique === 0
      ? 0
      : Math.min(40, (complementaryCount / totalUnique) * 40);

  return { score, uniqueToA, uniqueToB, common };
}

/**
 * Shared interests (max 20)
 */
const normalizedInterestsCache = new WeakMap<string[], string[]>();
function getCachedNormalizedInterests(interests: string[]): string[] {
  if (normalizedInterestsCache.has(interests)) return normalizedInterestsCache.get(interests)!;
  const arr = interests.map(normalizeTerm);
  normalizedInterestsCache.set(interests, arr);
  return arr;
}

function scoreSharedInterests(
  interestsA: string[],
  interestsB: string[]
): { score: number; shared: string[] } {
  const normA = getCachedNormalizedInterests(interestsA);
  const normB = new Set(getCachedNormalizedInterests(interestsB));

  const shared: string[] = [];
  for (const i of normA) {
    if (i && normB.has(i)) {
      // Use the original casing from A
      const original = interestsA.find(
        (x) => normalizeTerm(x) === i
      );
      if (original) shared.push(original);
    }
  }

  const maxLen = Math.max(interestsA.length, interestsB.length);
  const score =
    maxLen === 0 ? 0 : Math.min(20, (shared.length / maxLen) * 20);

  return { score, shared };
}

/**
 * Common skills (max 10)
 */
function scoreCommonSkills(
  skillsA: SkillInput[],
  skillsB: SkillInput[],
  commonNormalized: string[]
): number {
  const maxLen = Math.max(skillsA.length, skillsB.length);
  return maxLen === 0
    ? 0
    : Math.min(10, (commonNormalized.length / maxLen) * 10);
}

/**
 * Department compatibility (max 10)
 * - Same department → 10
 * - Same department family → 5
 * - Different → 0
 */
function scoreDepartment(
  deptA: string | null | undefined,
  deptB: string | null | undefined
): number {
  if (!deptA || !deptB) return 0;
  const normA = deptA.trim().toLowerCase();
  const normB = deptB.trim().toLowerCase();
  if (normA === normB) return 10;

  const groupA = getDeptGroup(deptA);
  const groupB = getDeptGroup(deptB);
  if (groupA && groupB && groupA === groupB) return 5;

  // Check if they share the same group even if getDeptGroup returned different refs
  if (groupA && groupB) {
    const setA = new Set(groupA.map((g) => g.toLowerCase()));
    for (const g of groupB) {
      if (setA.has(g.toLowerCase())) return 5;
    }
  }

  return 0;
}

/**
 * Academic year proximity (max 5)
 * diff 0 → 5, diff 1 → 5, diff 2 → 3, else → 0
 */
function scoreYear(
  yearA: string | null | undefined,
  yearB: string | null | undefined
): number {
  const a = yearToNumber(yearA);
  const b = yearToNumber(yearB);
  if (a === null || b === null) return 0;
  const diff = Math.abs(a - b);
  if (diff <= 1) return 5;
  if (diff <= 2) return 3;
  return 0;
}

/**
 * Availability overlap (max 15)
 *
 * Tokenizes availability text and checks for keyword overlap.
 * Both present + shared keywords → 15
 * Both present, no shared keywords → 8
 * Only one has availability → 0
 */
function scoreAvailability(
  availA: string | null | undefined,
  availB: string | null | undefined
): number {
  if (!availA || !availB) return 0;

  const tokenize = (s: string): Set<string> => {
    return new Set(
      s
        .toLowerCase()
        .split(/[\s,;/|&]+/)
        .map((t) => t.trim())
        .filter((t) => t.length > 2) // ignore very short tokens like "a", "to"
    );
  };

  const tokensA = tokenize(availA);
  const tokensB = tokenize(availB);

  let sharedCount = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) sharedCount++;
  }

  return sharedCount > 0 ? 15 : 8;
}

// ──────────────────────────────────────────────────────────────
// Reason generation
// ──────────────────────────────────────────────────────────────

/**
 * Generates human-readable, non-fabricated reasons for the match.
 * Only generates a reason when the data genuinely supports it.
 */
export function generateMatchReasons(
  breakdown: MatchScoreBreakdown,
  commonSkills: string[],
  complementarySkills: string[],
  sharedInterests: string[],
  profileA: ProfileInput,
  profileB: ProfileInput
): string[] {
  const reasons: string[] = [];

  // Complementary skills
  if (breakdown.complementarySkillsScore >= 20 && complementarySkills.length >= 3) {
    reasons.push(
      `Together you cover ${complementarySkills.length} distinct skills — strong collaboration potential.`
    );
  } else if (breakdown.complementarySkillsScore >= 10 && complementarySkills.length >= 1) {
    reasons.push(
      `Your skill sets complement each other across ${complementarySkills.length} area${complementarySkills.length > 1 ? "s" : ""}.`
    );
  }

  // Shared interests
  if (sharedInterests.length >= 2) {
    const sample = sharedInterests.slice(0, 2).join(" and ");
    reasons.push(`You share interests in ${sample}.`);
  } else if (sharedInterests.length === 1) {
    reasons.push(`You share an interest in ${sharedInterests[0]}.`);
  }

  // Common skills (overlap)
  if (commonSkills.length >= 3) {
    const sample = commonSkills.slice(0, 3).join(", ");
    reasons.push(`You both know ${sample} — easy to collaborate from day one.`);
  } else if (commonSkills.length >= 1) {
    const sample = commonSkills.join(" and ");
    reasons.push(`You both know ${sample}.`);
  }

  // Department
  if (breakdown.departmentScore === 10) {
    reasons.push(`You are both in ${profileA.department}.`);
  } else if (breakdown.departmentScore === 5) {
    reasons.push(`Your departments (${profileA.department} & ${profileB.department}) are closely related.`);
  }

  // Year
  if (breakdown.yearScore === 5 && profileA.year && profileB.year) {
    if (profileA.year === profileB.year) {
      reasons.push(`You are both in the same academic year.`);
    } else {
      reasons.push(`You are in similar academic stages — great for peer mentorship.`);
    }
  }

  // Availability
  if (breakdown.availabilityScore === 15) {
    reasons.push(`Your availability preferences align well.`);
  } else if (breakdown.availabilityScore === 8) {
    reasons.push(`You are both open to collaboration.`);
  }

  return reasons;
}

// ──────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────

/**
 * Calculates the full score breakdown between two profiles.
 * Pure function — no I/O, no side effects.
 */
export function calculateMatchScore(
  profileA: ProfileInput,
  profileB: ProfileInput
): MatchScoreBreakdown {
  const {
    score: complementarySkillsScore,
    common,
  } = scoreComplementarySkills(profileA.skills, profileB.skills);

  const commonSkillsScore = scoreCommonSkills(
    profileA.skills,
    profileB.skills,
    common
  );
  const { score: sharedInterestsScore } = scoreSharedInterests(
    profileA.interests,
    profileB.interests
  );
  const departmentScore = scoreDepartment(profileA.department, profileB.department);
  const yearScore = scoreYear(profileA.year, profileB.year);
  const availabilityScore = scoreAvailability(
    profileA.availability,
    profileB.availability
  );

  const overallScore = Math.round(
    complementarySkillsScore +
      sharedInterestsScore +
      commonSkillsScore +
      departmentScore +
      yearScore +
      availabilityScore
  );

  return {
    complementarySkillsScore: Math.round(complementarySkillsScore * 10) / 10,
    sharedInterestsScore: Math.round(sharedInterestsScore * 10) / 10,
    commonSkillsScore: Math.round(commonSkillsScore * 10) / 10,
    departmentScore,
    yearScore,
    availabilityScore,
    overallScore: Math.min(100, Math.max(0, overallScore)),
  };
}

/**
 * Full match between two profiles — returns a rich MatchResult.
 *
 * targetInfo is extra display data about profileB (name, image, etc.)
 * that comes from the DB layer, not part of scoring logic.
 */
export function matchProfiles(
  profileA: ProfileInput,
  profileB: ProfileInput,
  targetInfo: {
    name: string;
    image: string | null;
    profileImage: string | null;
  }
): MatchResult {
  const {
    score: complementarySkillsScore,
    uniqueToA,
    uniqueToB,
    common,
  } = scoreComplementarySkills(profileA.skills, profileB.skills);

  const commonSkillsScore = scoreCommonSkills(profileA.skills, profileB.skills, common);

  const {
    score: sharedInterestsScore,
    shared: sharedInterests,
  } = scoreSharedInterests(profileA.interests, profileB.interests);

  const departmentScore = scoreDepartment(profileA.department, profileB.department);
  const yearScore = scoreYear(profileA.year, profileB.year);
  const availabilityScore = scoreAvailability(profileA.availability, profileB.availability);

  const overallScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        complementarySkillsScore +
          sharedInterestsScore +
          commonSkillsScore +
          departmentScore +
          yearScore +
          availabilityScore
      )
    )
  );

  const scoreBreakdown: MatchScoreBreakdown = {
    complementarySkillsScore: Math.round(complementarySkillsScore * 10) / 10,
    sharedInterestsScore: Math.round(sharedInterestsScore * 10) / 10,
    commonSkillsScore: Math.round(commonSkillsScore * 10) / 10,
    departmentScore,
    yearScore,
    availabilityScore,
    overallScore,
  };

// Restore original casing for display
  const commonSkillsDisplay = profileA.skills
    .filter((s) => common.includes(normalizeSkillName(s.name)))
    .map((s) => s.name);

  const complementarySkillsDisplay = [
    ...profileA.skills
      .filter((s) => uniqueToA.includes(normalizeSkillName(s.name)))
      .map((s) => s.name),
    ...profileB.skills
      .filter((s) => uniqueToB.includes(normalizeSkillName(s.name)))
      .map((s) => s.name),
  ];

  const reasons = generateMatchReasons(
    scoreBreakdown,
    commonSkillsDisplay,
    complementarySkillsDisplay,
    sharedInterests,
    profileA,
    profileB
  );

  return {
    targetUserId: profileB.id,
    targetName: targetInfo.name,
    targetImage: targetInfo.image,
    targetProfileImage: targetInfo.profileImage,
    targetDepartment: profileB.department ?? null,
    targetYear: profileB.year ?? null,
    targetSkills: profileB.skills,
    targetInterests: profileB.interests,
    scoreBreakdown,
    overallScore,
    commonSkills: commonSkillsDisplay,
    complementarySkills: complementarySkillsDisplay,
    sharedInterests,
    reasons,
  };
}

// ──────────────────────────────────────────────────────────────
// Project Requirement Matching
// ──────────────────────────────────────────────────────────────

export interface ProjectRequirementsInput {
  requiredSkills: SkillInput[];
  preferredSkills: SkillInput[];
}

export interface ProjectMatchResult {
  requiredMatched: string[];
  requiredMissing: string[];
  preferredMatched: string[];
  preferredMissing: string[];
  overallScore: number;
  reasons: string[];
}

/**
 * Evaluates how well a candidate's skills match a project's requirements.
 * 
 * Scoring (100 total):
 * - Required skill coverage (70)
 * - Preferred skill coverage (20)
 * - Skill proficiency relevance (10)
 */
export function matchCandidateToProject(
  candidateSkills: SkillInput[],
  projectReqs: ProjectRequirementsInput
): ProjectMatchResult {
  const candidateSet = new Map<string, string | null>();
  for (const s of candidateSkills) {
    candidateSet.set(normalizeSkillName(s.name), s.proficiency ?? null);
  }

  const requiredMatched: string[] = [];
  const requiredMissing: string[] = [];
  const preferredMatched: string[] = [];
  const preferredMissing: string[] = [];

  let requiredScore = 0;
  let preferredScore = 0;
  let proficiencyScore = 0;
  let maxProficiencyScore = 0;

  // Helper to score proficiency
  const scoreProficiency = (reqSkill: string, candidateProf: string | null) => {
    maxProficiencyScore += 2; // Arbitrary weight per skill
    if (candidateProf === "Advanced") proficiencyScore += 2;
    else if (candidateProf === "Intermediate") proficiencyScore += 1;
    else if (candidateProf === "Beginner") proficiencyScore += 0.5;
  };

  for (const req of projectReqs.requiredSkills) {
    const norm = normalizeSkillName(req.name);
    if (candidateSet.has(norm)) {
      requiredMatched.push(req.name);
      scoreProficiency(req.name, candidateSet.get(norm) ?? null);
    } else {
      requiredMissing.push(req.name);
    }
  }

  for (const pref of projectReqs.preferredSkills) {
    const norm = normalizeSkillName(pref.name);
    if (candidateSet.has(norm)) {
      preferredMatched.push(pref.name);
      scoreProficiency(pref.name, candidateSet.get(norm) ?? null);
    } else {
      preferredMissing.push(pref.name);
    }
  }

  if (projectReqs.requiredSkills.length > 0) {
    requiredScore = (requiredMatched.length / projectReqs.requiredSkills.length) * 70;
  } else {
    // If no required skills, reallocate the 70 points
    requiredScore = 70; 
    // Or just treat the project as open. We'll give 70 points automatically if there are no strict requirements.
  }

  if (projectReqs.preferredSkills.length > 0) {
    preferredScore = (preferredMatched.length / projectReqs.preferredSkills.length) * 20;
  } else {
    // If no preferred skills, reallocate the 20 points
    preferredScore = 20; 
  }

  const normalizedProficiencyScore = maxProficiencyScore > 0 
    ? (proficiencyScore / maxProficiencyScore) * 10 
    : 10;

  // If there are literally no requirements, return 0 (not a matchable project yet)
  if (projectReqs.requiredSkills.length === 0 && projectReqs.preferredSkills.length === 0) {
    return {
      requiredMatched,
      requiredMissing,
      preferredMatched,
      preferredMissing,
      overallScore: 0,
      reasons: []
    };
  }

  const overallScore = Math.round(requiredScore + preferredScore + normalizedProficiencyScore);

  const reasons: string[] = [];
  
  if (projectReqs.requiredSkills.length > 0) {
    if (requiredMatched.length === projectReqs.requiredSkills.length) {
      reasons.push(`Matches all ${requiredMatched.length} required skills.`);
    } else if (requiredMatched.length > 0) {
      reasons.push(`Matches ${requiredMatched.length} of ${projectReqs.requiredSkills.length} required skills.`);
    }
  }

  if (preferredMatched.length > 0) {
    reasons.push(`Matches ${preferredMatched.length} preferred skill${preferredMatched.length > 1 ? 's' : ''}.`);
  }

  if (proficiencyScore > (maxProficiencyScore / 2)) {
    reasons.push(`Has strong proficiency in matching skills.`);
  }

  return {
    requiredMatched,
    requiredMissing,
    preferredMatched,
    preferredMissing,
    overallScore: Math.min(100, Math.max(0, overallScore)),
    reasons
  };
}


