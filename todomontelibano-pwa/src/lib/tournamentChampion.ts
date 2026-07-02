import type { TeamStanding, TournamentStructure } from '../types/sports';

export interface ChampionInfo {
  teamId: string;
  teamName: string;
  logo?: string;
}

function winnerFromFinishedMatch(
  match: NonNullable<import('../types/sports').BracketNode['match']>,
  isSoftball: boolean
): { teamId: string; teamName: string; logo?: string } | null {
  if (match.status !== 'finished') return null;

  const homeVal = isSoftball ? match.home_runs : match.home_score;
  const awayVal = isSoftball ? match.away_runs : match.away_score;
  if (homeVal == null || awayVal == null) return null;

  if (homeVal > awayVal) {
    return {
      teamId: String(match.home_team),
      teamName: match.home_team_name || 'Local',
      logo: match.home_team_logo,
    };
  }
  if (awayVal > homeVal) {
    return {
      teamId: String(match.away_team),
      teamName: match.away_team_name || 'Visitante',
      logo: match.away_team_logo,
    };
  }
  return null;
}

/** Campeón del torneo (final jugada o liga terminada). */
export function resolveTournamentChampion(
  structure: TournamentStructure | undefined,
  standings: TeamStanding[] | undefined,
  options: {
    isSoftball: boolean;
    tournamentStatus?: string;
    isStructured?: boolean;
  }
): ChampionInfo | null {
  const { isSoftball, tournamentStatus, isStructured } = options;

  if (structure?.phases?.length) {
    const knockoutPhases = [...structure.phases]
      .filter((p) => p.phase_type === 'knockout')
      .sort((a, b) => b.order - a.order);

    const finalPhase =
      knockoutPhases.find((p) => p.slug === 'final') ?? knockoutPhases[0];

    const finalNode =
      finalPhase?.bracket?.nodes?.find((n) => n.round === 'final') ??
      finalPhase?.bracket?.nodes?.slice(-1)[0];

    if (finalNode?.match) {
      const winner = winnerFromFinishedMatch(finalNode.match, isSoftball);
      if (winner) return winner;
    }
  }

  if (!isStructured && standings?.length) {
    const isFinished =
      tournamentStatus === 'finished' || tournamentStatus === 'completed';
    if (isFinished) {
      const leader = standings.find((s) => s.position === 1);
      if (leader) {
        return {
          teamId: leader.team.id,
          teamName: leader.team.name,
          logo: leader.team.logo,
        };
      }
    }
  }

  return null;
}

/** Líder del scope actual (1° en tabla) — no necesariamente campeón del torneo. */
export function isScopeLeader(
  teamId: string,
  standings: TeamStanding[],
  championId: string | null
): boolean {
  if (championId && teamId === championId) return false;
  const leader = standings.find((s) => s.position === 1);
  return leader?.team.id === teamId;
}
