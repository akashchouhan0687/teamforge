export type ProfileCompletionResult = {
  percentage: number;
  isComplete: boolean; // Required fields (name, department, year) filled
  completedFields: string[];
  missingFields: string[];
};

export const COMMON_DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Software Engineering",
  "Data Science",
  "Electrical Engineering",
  "Computer Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business & Management",
  "Design & Media",
  "Mathematics",
  "Physics",
  "Other",
] as const;

export const ACADEMIC_YEARS = [
  "1st Year (Freshman)",
  "2nd Year (Sophomore)",
  "3rd Year (Junior)",
  "4th Year (Senior)",
  "Graduate (Master's)",
  "PhD Candidate",
  "Alumni",
] as const;

interface UserWithProfileAndSkills {
  name?: string | null;
  image?: string | null;
  profile?: {
    department?: string | null;
    year?: string | null;
    bio?: string | null;
    location?: string | null;
    profileImage?: string | null;
    interests?: string | null;
  } | null;
  skills?: unknown[] | null;
}

/**
 * Calculates a genuine profile completion percentage based on field weights:
 * - Full Name (Required): 15%
 * - Department (Required): 15%
 * - Year (Required): 15%
 * - Bio: 15%
 * - Location: 10%
 * - Profile Photo: 10%
 * - Interests: 10%
 * - Skills: 10%
 * Total = 100%
 */
export function calculateProfileCompletion(
  user: UserWithProfileAndSkills
): ProfileCompletionResult {
  const completedFields: string[] = [];
  const missingFields: string[] = [];
  let score = 0;

  // Name (15%)
  if (user?.name && user.name.trim().length > 0) {
    score += 15;
    completedFields.push("Full Name");
  } else {
    missingFields.push("Full Name");
  }

  // Department (15%)
  if (user?.profile?.department && user.profile.department.trim().length > 0) {
    score += 15;
    completedFields.push("Department");
  } else {
    missingFields.push("Department");
  }

  // Year (15%)
  if (user?.profile?.year && user.profile.year.trim().length > 0) {
    score += 15;
    completedFields.push("Academic Year");
  } else {
    missingFields.push("Academic Year");
  }

  // Bio (15%)
  if (user?.profile?.bio && user.profile.bio.trim().length > 0) {
    score += 15;
    completedFields.push("Bio");
  } else {
    missingFields.push("Bio");
  }

  // Location (10%)
  if (user?.profile?.location && user.profile.location.trim().length > 0) {
    score += 10;
    completedFields.push("Location");
  } else {
    missingFields.push("Location");
  }

  // Profile Image (10%)
  const hasImage =
    (user?.profile?.profileImage && user.profile.profileImage.trim().length > 0) ||
    (user?.image && user.image.trim().length > 0);
  if (hasImage) {
    score += 10;
    completedFields.push("Profile Photo");
  } else {
    missingFields.push("Profile Photo");
  }

  // Interests (10%)
  if (user?.profile?.interests && user.profile.interests.trim().length > 0) {
    score += 10;
    completedFields.push("Interests");
  } else {
    missingFields.push("Interests");
  }

  // Skills (10%)
  if (user?.skills && Array.isArray(user.skills) && user.skills.length > 0) {
    score += 10;
    completedFields.push("Skills");
  } else {
    missingFields.push("Skills");
  }

  const isComplete =
    !!user?.name?.trim() &&
    !!user?.profile?.department?.trim() &&
    !!user?.profile?.year?.trim();

  return {
    percentage: Math.min(100, Math.max(0, score)),
    isComplete,
    completedFields,
    missingFields,
  };
}
