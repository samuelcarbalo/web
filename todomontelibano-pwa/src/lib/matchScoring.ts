import type { Match, SportType } from '../types/sports';

export function getMatchHomeScore(match: Match, sportType: SportType): number {
  if (sportType === 'softball') {
    return match.home_runs ?? match.home_score ?? 0;
  }
  return match.home_score ?? 0;
}

export function getMatchAwayScore(match: Match, sportType: SportType): number {
  if (sportType === 'softball') {
    return match.away_runs ?? match.away_score ?? 0;
  }
  return match.away_score ?? 0;
}

export function buildFinishScorePayload(
  sportType: SportType,
  home: number,
  away: number
): { home_score?: number; away_score?: number; home_runs?: number; away_runs?: number } {
  if (sportType === 'softball') {
    return { home_runs: home, away_runs: away, home_score: home, away_score: away };
  }
  return { home_score: home, away_score: away };
}

export function getScoreLabel(sportType: SportType): string {
  return sportType === 'softball' ? 'Carreras' : 'Goles';
}
