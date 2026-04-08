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