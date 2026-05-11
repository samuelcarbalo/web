export type SportType = 'football' | 'softball' | 'basketball' | 'volleyball';

export interface Tournament {
  id: string;
  name: string;
  slug: string;
  description: string;
  sport_type: SportType;
  organization: string;
  organization_name?: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  max_teams: number;
  min_players_per_team: number;
  max_players_per_team: number;
  logo?: string;
  banner?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  teams_count: number;
  created_at: string;
  updated_at: string;
  is_registration_open: boolean;
  posted_by: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
  
export interface CreateTournamentData {
  name: string;
  description: string;
  sport_type: SportType;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  max_teams: number;
  min_players_per_team: number;
  max_players_per_team: number;
  organization: string;
  slug: string;
  logo?: string;
  banner?: string;
}

export const sportTypeLabels: Record<SportType, string> = {
  football: 'Fútbol',
  softball: 'Softbol',
  basketball: 'Baloncesto',
  volleyball: 'Voleibol',
};

export const sportTypeColors: Record<SportType, string> = {
  football: 'bg-green-500',
  softball: 'bg-yellow-500',
  basketball: 'bg-orange-500',
  volleyball: 'bg-blue-500',
};

// Agregar a los tipos existentes
export interface Team {
  id: string;
  name: string;
  slug: string;
  abbreviation: string;
  description?: string;
  tournament: string;
  tournament_name?: string;
  organization: string;
  primary_color: string;
  secondary_color: string;
  logo?: string;
  coach_name?: string;
  coach_email?: string;
  coach_phone?: string;
  players_count: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  points: number;
  runs: number;
  runs_against: number;
  strikes: number;
  strikes_against: number;
  walks: number;
  walks_against: number;
  home_runs: number;
  home_runs_against: number;
  strikes_out: number;
  strikes_out_against: number;
  goal_difference: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTeamData {
  name: string;
  abbreviation: string;
  description?: string;
  slug?: string;
  tournament: string;
  organization: string;
  primary_color: string;
  secondary_color: string;
  logo?: string;
  coach_name?: string;
  coach_email?: string;
  coach_phone?: string;
}

export interface Player {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
  jersey_number: number;
  position: string;
  position_display: string;
  team: string;
  team_name: string;
  photo: string | null;
  birth_date: string | null;
  nationality: string | null;
  is_captain: boolean;
  is_active: boolean;
  matches_played: number;
  goals: number;
  assists: number;
  average: number | null;
  tournament: string;
  tournament_name: string;
  tournament_slug: string;
  sport_type: SportType;
  yellow_cards: number;
  red_cards: number;
  strikes: number;
  strikes_against: number;
  walks: number;
  walks_against: number;
  home_runs: number;
  home_runs_against: number;
  strikes_out: number;
  strikes_out_against: number;
  average_runs: number | null;
  average_strikes: number | null;
  average_walks: number | null;
  average_home_runs: number | null;
  average_strikes_out: number | null;
  average_assists: number | null;
  average_yellow_cards: number | null;
  average_red_cards: number | null;
  average_goals: number | null;
  average_goals_against: number | null;
  saves: number | null;
  save_percentage: number | null;
  innings_pitched: number | null;
  earned_runs: number | null;
  innings_pitched_against: number | null;
  earned_runs_against: number | null;
  batters_faced: number | null;
  batting_average: number | null;
  rbis: number | null;
  on_base_percentage: number | null;
}

export interface CreatePlayerData {
  first_name: string;
  last_name: string;
  nickname?: string;
  jersey_number: number;
  position: string;
  team: string | Player;
  birth_date?: string;
  nationality?: string;
  photo?: string;
  is_captain?: boolean;
  is_active?: boolean;
  tournament?: string;
  posted_by_id?: string;
}

// Types
export interface Match {
  id: string;
  tournament: string;
  tournament_name: string;
  tournament_slug: string;
  home_team: string;
  home_team_logo?: string;
  home_team_name?: string;
  home_team_detail?: Team;
  away_team_detail?: Team;
  away_team: string;
  away_team_name?: string;
  away_team_logo?: string;
  home_score: number | null;
  away_score: number | null;
  home_runs: number | null;
  away_runs: number | null;
  match_date: string;
  venue: string;
  started_at: string | null;
  finished_at: string | null;
  stadium: string;
  status: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';
  status_display: string;
  round_number: number;
  match_week: number;
  sport_type?: string;
  notes: string;
  posted_by: string;
  events: MatchEvent[];
  start_time?: string;
  end_time?: string;
}

export interface MatchEvent {
  id: string;
  event_type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'injury' | 'other';
  event_type_display: string;
  minute: number;
  player: string;
  player_name: string;
  team: string;
  team_name: string;
  description: string;
}

export interface CreateMatchData {
  tournament: string;
  home_team: string;
  away_team: string;
  match_date: string;
  venue?: string;
  stadium?: string;
  round_number?: number;
  match_week?: number;
  notes?: string;
}


export interface MatchPeriod {
  id: string;
  match: string;
  period_number: number;
  name: string;
  started_at: string | null;
  paused_at: string | null;
  resumed_at: string | null;
  ended_at: string | null;
  elapsed_seconds: number;
  elapsed_minutes: number;
  is_active: boolean;
  is_completed: boolean;
}

// Agregar al final del archivo
export interface MatchPeriod {
  id: string;
  match: string;
  period_number: number;
  name: string;
  started_at: string | null;
  paused_at: string | null;
  resumed_at: string | null;
  ended_at: string | null;
  elapsed_seconds: number;
  elapsed_minutes: number;
  is_active: boolean;
  is_completed: boolean;
}