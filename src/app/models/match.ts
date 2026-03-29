export interface Match {
  id: string;
  tournament_name: string;
  event_date: string;
  fighter_1_id: string;
  fighter_2_id: string;
  status: string;
  is_deleted: boolean;      
  last_modified_id?: string; 
  fighter1?: { full_name: string };
  fighter2?: { full_name: string };
}