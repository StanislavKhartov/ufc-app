export interface Match {
  id: string;
  tournament_name: string;
  event_date: string;
  fighter_1_id: string;
  fighter_2_id: string;
  status: string;
  notes: string;
  fighter1?: { full_name: string };
  fighter2?: { full_name: string };
}