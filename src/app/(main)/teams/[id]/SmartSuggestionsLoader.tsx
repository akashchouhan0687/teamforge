import { Suspense } from "react";
import { db } from "@/lib/db";
import { scoreTeamCandidate } from "@/lib/team-recommendations";
import { SmartSuggestions } from "./SmartSuggestions";

export async function SmartSuggestionsLoader({ teamId, ownerBaselineProfile, gapAnalysis, isOwner, isTeamFull, hasRequirements, hasGaps }: any) {
  let recommendations: any[] = [];
  
  if (isOwner && ((gapAnalysis.hasRequirements && gapAnalysis.missingRequiredCount > 0) || gapAnalysis.missingPreferredCount > 0)) {
    const [availableUsers, pendingRequests] = await Promise.all([
      db.user.findMany({
        where: {
          teamMembers: { none: { teamId: teamId } }
        },
        select: {
          id: true,
          name: true,
          image: true,
          profile: {
            select: {
              department: true,
              year: true,
              bio: true,
              location: true,
              profileImage: true,
              interests: true,
            }
          },
          skills: { include: { skill: true } }
        },
        orderBy: { name: 'asc' }
      }),
      db.teamRequest.findMany({
        where: { teamId: teamId, status: 'pending' },
        select: { receiverId: true }
      })
    ]);
    const pendingUserIds = new Set(pendingRequests.map((r: any) => r.receiverId));

    const scoredCandidates = availableUsers
      .filter((u: any) => u.id !== ownerBaselineProfile.id)
      .map((u: any) => {
        const candidateProfile = {
          id: u.id,
          name: u.name,
          image: u.image,
          profileImage: u.profile?.profileImage || null,
          department: u.profile?.department,
          year: u.profile?.year,
          interests: u.profile?.interests?.split(",") || [],
          availability: u.profile?.bio,
          skills: u.skills.map((s: any) => s.skill),
          teamOwnerProfile: ownerBaselineProfile as any
        };
        
        const scoreResult = scoreTeamCandidate(candidateProfile as any, gapAnalysis);
        if (scoreResult) {
          return {
            ...scoreResult,
            hasPendingInvite: pendingUserIds.has(u.id)
          };
        }
        return null;
      })
      .filter(Boolean) as any[];

    recommendations = scoredCandidates.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
  }

  return (
    <SmartSuggestions 
      teamId={teamId}
      recommendations={recommendations}
      isOwner={isOwner}
      isTeamFull={isTeamFull}
      hasRequirements={hasRequirements}
      hasGaps={hasGaps}
    />
  );
}

export function SmartSuggestionsSkeleton() {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm animate-pulse space-y-6">
      <div className="h-6 w-48 bg-muted rounded-lg" />
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4 p-4 border rounded-2xl bg-background">
            <div className="h-12 w-12 rounded-full bg-muted shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-32 bg-muted rounded" />
              <div className="h-3 w-48 bg-muted rounded" />
            </div>
            <div className="h-8 w-20 bg-muted rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

