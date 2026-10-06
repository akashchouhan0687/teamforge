import { ProjectRequirementsInput, SkillInput } from "./matching";

export interface TeamMemberInput {
  userId: string;
  name: string;
  skills: SkillInput[];
}

export interface SkillProvider {
  name: string;
  proficiency?: string | null;
}

export interface SkillGapDetail {
  skill: SkillInput;
  status: "COVERED" | "MISSING";
  priority: "HIGH" | "MEDIUM" | "COVERED";
  providedBy: SkillProvider[];
}

export interface TeamGapAnalysisResult {
  hasRequirements: boolean;
  requiredSkills: SkillGapDetail[];
  preferredSkills: SkillGapDetail[];
  coveredRequiredCount: number;
  missingRequiredCount: number;
  coveredPreferredCount: number;
  missingPreferredCount: number;
  coveragePercentage: number;
  overallStatus: string;
}

/**
 * Analyzes the skill gaps of a team against a project's requirements.
 */
export function analyzeTeamSkillGaps(
  projectRequirements: ProjectRequirementsInput,
  teamMembers: TeamMemberInput[]
): TeamGapAnalysisResult {
  const reqSkills = projectRequirements.requiredSkills || [];
  const prefSkills = projectRequirements.preferredSkills || [];
  
  const hasRequirements = reqSkills.length > 0 || prefSkills.length > 0;

  if (!hasRequirements) {
    return {
      hasRequirements: false,
      requiredSkills: [],
      preferredSkills: [],
      coveredRequiredCount: 0,
      missingRequiredCount: 0,
      coveredPreferredCount: 0,
      missingPreferredCount: 0,
      coveragePercentage: 0,
      overallStatus: "Requirements not defined"
    };
  }

  // Pre-process team skills into a fast lookup map:
  // skillName (normalized) -> array of providers
  const teamSkillMap = new Map<string, SkillProvider[]>();
  
  for (const member of teamMembers) {
    for (const skill of member.skills) {
      const norm = skill.name.toLowerCase().trim();
      if (!teamSkillMap.has(norm)) {
        teamSkillMap.set(norm, []);
      }
      teamSkillMap.get(norm)!.push({
        name: member.name,
        proficiency: skill.proficiency
      });
    }
  }

  // Process required skills
  const requiredSkillsAnalysis: SkillGapDetail[] = [];
  let coveredRequiredCount = 0;
  
  for (const req of reqSkills) {
    const norm = req.name.toLowerCase().trim();
    const providers = teamSkillMap.get(norm) || [];
    
    if (providers.length > 0) {
      coveredRequiredCount++;
      requiredSkillsAnalysis.push({
        skill: req,
        status: "COVERED",
        priority: "COVERED",
        providedBy: providers
      });
    } else {
      requiredSkillsAnalysis.push({
        skill: req,
        status: "MISSING",
        priority: "HIGH",
        providedBy: []
      });
    }
  }

  // Process preferred skills
  const preferredSkillsAnalysis: SkillGapDetail[] = [];
  let coveredPreferredCount = 0;
  
  for (const pref of prefSkills) {
    const norm = pref.name.toLowerCase().trim();
    const providers = teamSkillMap.get(norm) || [];
    
    if (providers.length > 0) {
      coveredPreferredCount++;
      preferredSkillsAnalysis.push({
        skill: pref,
        status: "COVERED",
        priority: "COVERED",
        providedBy: providers
      });
    } else {
      preferredSkillsAnalysis.push({
        skill: pref,
        status: "MISSING",
        priority: "MEDIUM",
        providedBy: []
      });
    }
  }

  const missingRequiredCount = reqSkills.length - coveredRequiredCount;
  const missingPreferredCount = prefSkills.length - coveredPreferredCount;
  
  const coveragePercentage = reqSkills.length > 0 
    ? Math.round((coveredRequiredCount / reqSkills.length) * 100)
    : 100; // If there are only preferred skills, basic coverage is considered 100%

  let overallStatus = "";
  if (reqSkills.length === 0) {
    overallStatus = "No required skills defined";
  } else if (coveragePercentage === 100) {
    overallStatus = "All required skills covered";
  } else if (coveragePercentage >= 75) {
    overallStatus = "Almost complete";
  } else if (coveragePercentage >= 50) {
    overallStatus = "Several skill gaps";
  } else if (coveragePercentage > 0) {
    overallStatus = "Major skill gaps";
  } else {
    overallStatus = "No required skills covered yet";
  }

  return {
    hasRequirements,
    requiredSkills: requiredSkillsAnalysis,
    preferredSkills: preferredSkillsAnalysis,
    coveredRequiredCount,
    missingRequiredCount,
    coveredPreferredCount,
    missingPreferredCount,
    coveragePercentage,
    overallStatus
  };
}
