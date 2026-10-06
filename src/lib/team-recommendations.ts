import { ProfileInput, SkillInput, calculateMatchScore } from "./matching";
import { TeamGapAnalysisResult } from "./team-coverage";

export interface CandidateRecommendation {
  userId: string;
  name: string;
  image: string | null;
  profileImage: string | null;
  department: string | null;
  year: string | null;
  skills: SkillInput[];
  
  matchScore: number;
  gapSkillsFilled: string[];
  matchedPreferredSkills: string[];
  reasons: string[];
  hasPendingInvite?: boolean;
}

/**
 * Normalizes a skill name for comparison.
 */
function normalize(name: string): string {
  return name.toLowerCase().trim();
}

/**
 * Scores a candidate for a team based on the team's current skill gaps.
 * 
 * Scoring System (100 total):
 * A. Missing required skill coverage — 50%
 * B. Complementary skills (from missing preferred) — 20%
 * C. Project required/preferred skill overlap — 10%
 * D. Shared/intersecting interests — 10%
 * E. Department/academic compatibility — 5%
 * F. Availability compatibility — 5%
 */
export function scoreTeamCandidate(
  candidate: ProfileInput & { 
    name: string, 
    image: string | null, 
    profileImage: string | null,
    teamOwnerProfile: ProfileInput // For baseline interest/dept matching
  },
  gapAnalysis: TeamGapAnalysisResult
): CandidateRecommendation | null {
  
  const missingRequired = gapAnalysis.requiredSkills.filter(s => s.status === 'MISSING').map(s => s.skill);
  const missingPreferred = gapAnalysis.preferredSkills.filter(s => s.status === 'MISSING').map(s => s.skill);
  const coveredRequired = gapAnalysis.requiredSkills.filter(s => s.status === 'COVERED').map(s => s.skill);
  const coveredPreferred = gapAnalysis.preferredSkills.filter(s => s.status === 'COVERED').map(s => s.skill);
  
  const candidateSkills = new Map<string, SkillInput>();
  for (const s of candidate.skills) {
    candidateSkills.set(normalize(s.name), s);
  }

  const gapSkillsFilled: string[] = [];
  let requiredGapScore = 0;
  let maxRequiredGapScore = missingRequired.length > 0 ? 50 : 0;
  
  // 1. Missing Required Skill Coverage (50 points)
  if (missingRequired.length > 0) {
    let filledRequiredCount = 0;
    for (const req of missingRequired) {
      const norm = normalize(req.name);
      if (candidateSkills.has(norm)) {
        filledRequiredCount++;
        gapSkillsFilled.push(req.name);
        
        // Proficiency bonus (slight bump)
        const prof = candidateSkills.get(norm)?.proficiency;
        if (prof === "Advanced") requiredGapScore += 1;
        else if (prof === "Intermediate") requiredGapScore += 0.5;
      }
    }
    requiredGapScore += (filledRequiredCount / missingRequired.length) * 50;
  }
  
  // If there are missing required skills but the candidate fills NONE of them, they are NOT a gap-based recommendation.
  // Unless there are NO missing required skills, but there are missing preferred skills.
  if (missingRequired.length > 0 && gapSkillsFilled.length === 0) {
    return null;
  }

  // 2. Missing Preferred Skill Coverage (20 points)
  const matchedPreferredSkills: string[] = [];
  let preferredGapScore = 0;
  let maxPreferredGapScore = missingPreferred.length > 0 ? 20 : 0;
  
  if (missingPreferred.length > 0) {
    let filledPreferredCount = 0;
    for (const pref of missingPreferred) {
      if (candidateSkills.has(normalize(pref.name))) {
        filledPreferredCount++;
        matchedPreferredSkills.push(pref.name);
      }
    }
    preferredGapScore += (filledPreferredCount / missingPreferred.length) * 20;
  }
  
  // If project has NO missing skills at all, do not recommend
  if (missingRequired.length === 0 && missingPreferred.length === 0) {
    return null;
  }

  // 3. Base matching score with Team Owner (representing the team's core culture)
  // Re-use Phase 6 calculateMatchScore to get shared interests, dept, availability
  const baseMatch = calculateMatchScore(candidate.teamOwnerProfile, {
    id: candidate.id,
    department: candidate.department,
    year: candidate.year,
    interests: candidate.interests,
    availability: candidate.availability,
    skills: candidate.skills
  });
  
  // We extract D, E, F from baseMatch
  const interestsScore = baseMatch.sharedInterestsScore; // max 20, we want max 10
  const normalizedInterestsScore = (interestsScore / 20) * 10;
  
  const departmentScore = baseMatch.departmentScore; // max 10, we want max 5
  const normalizedDepartmentScore = (departmentScore / 10) * 5;
  
  const availabilityScore = baseMatch.availabilityScore; // max 15, we want max 5
  const normalizedAvailabilityScore = (availabilityScore / 15) * 5;
  
  // C. General overlap with already covered project skills (10 points)
  let overlapScore = 0;
  const totalCovered = coveredRequired.length + coveredPreferred.length;
  if (totalCovered > 0) {
    let overlapCount = 0;
    for (const skill of [...coveredRequired, ...coveredPreferred]) {
      if (candidateSkills.has(normalize(skill.name))) {
        overlapCount++;
      }
    }
    overlapScore = (overlapCount / totalCovered) * 10;
  } else {
    overlapScore = 10;
  }
  
  // If there were no required skills, re-weight preferred gaps
  if (maxRequiredGapScore === 0 && maxPreferredGapScore > 0) {
    preferredGapScore = (preferredGapScore / 20) * 70; // bump up to 70
  }

  const overallScore = Math.min(100, Math.round(
    requiredGapScore + 
    preferredGapScore + 
    overlapScore + 
    normalizedInterestsScore + 
    normalizedDepartmentScore + 
    normalizedAvailabilityScore
  ));

  // Generate Reasons
  const reasons: string[] = [];
  
  if (gapSkillsFilled.length > 0) {
    if (gapSkillsFilled.length === 1) {
      reasons.push(`✓ Covers missing ${gapSkillsFilled[0]} skill`);
    } else {
      reasons.push(`✓ Fills ${gapSkillsFilled.length} required skill gaps (${gapSkillsFilled.slice(0, 2).join(', ')})`);
    }
  }
  
  if (matchedPreferredSkills.length > 0) {
    if (matchedPreferredSkills.length === 1) {
      reasons.push(`✓ Matches preferred ${matchedPreferredSkills[0]} skill`);
    } else {
      reasons.push(`✓ Matches ${matchedPreferredSkills.length} preferred skills`);
    }
  }
  
  if (overlapScore > 5) {
    reasons.push(`✓ Has complementary skills for the project`);
  }
  
  if (normalizedInterestsScore > 3) {
    reasons.push(`✓ Shares interests with the team`);
  }
  
  if (reasons.length === 0) {
    reasons.push(`✓ Matches the project's technical requirements`);
  }

  return {
    userId: candidate.id,
    name: candidate.name,
    image: candidate.image,
    profileImage: candidate.profileImage,
    department: candidate.department ?? null,
    year: candidate.year ?? null,
    skills: candidate.skills,
    matchScore: overallScore,
    gapSkillsFilled,
    matchedPreferredSkills,
    reasons
  };
}
