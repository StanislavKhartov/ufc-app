import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Fighter} from '../models/fighter';
import { Match } from '../models/match';

@Injectable({ providedIn: 'root' })
export class DataService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient('https://ktsjogzkdvfejpzqhnct.supabase.co', 'sb_publishable_Kbxm3kO6Inm12UbiOkNyVA_aG4kdh2D');
  }

  async getFighters() {
    const { data } = await this.supabase.from('fighters').select('*').order('full_name');
    return data as Fighter[];
  }

  async getMatches() {
    const { data } = await this.supabase
      .from('matches')
      .select(`
        *,
        fighter1:fighters!fighter_1_id(full_name),
        fighter2:fighters!fighter_2_id(full_name)
      `)
      .order('event_date', { ascending: false });
    return data as Match[];
  }
}