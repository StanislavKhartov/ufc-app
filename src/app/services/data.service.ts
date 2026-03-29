import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class DataService {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient('https://ktsjogzkdvfejpzqhnct.supabase.co', 'sb_publishable_Kbxm3kO6Inm12UbiOkNyVA_aG4kdh2D');
    }

    async getFighters() {
        const { data } = await this.supabase
            .from('fighters')
            .select('*')
            .eq('is_deleted', false)
            .order('full_name');
        return data || [];
    }

    async getMatches() {
        const { data } = await this.supabase
            .from('matches')
            .select(`*, fighter1:fighters!fighter_1_id(full_name), fighter2:fighters!fighter_2_id(full_name)`)
            .eq('is_deleted', false)
            .order('event_date', { ascending: false });
        return data || [];
    }

    async delete(table: string, id: string) {
        return await this.supabase
            .from(table)
            .update({ is_deleted: true })
            .eq('id', id);
    }

    async save(table: string, item: any) {
        if (item.id) {
            const oldId = item.id;

            await this.supabase
                .from(table)
                .update({ is_deleted: true })
                .eq('id', oldId);

            const { id, fighter1, fighter2, ...newData } = item;

            const payload = {
                ...newData,
                is_deleted: false,
                last_modified_id: oldId
            };

            return await this.supabase.from(table).insert(payload).select();
        }

        else {
            return await this.supabase.from(table).insert(item).select();
        }
    }

    async deleteMultiple(table: string, ids: string[]) {
  return await this.supabase
    .from(table)
    .update({ is_deleted: true })
    .in('id', ids);
}
}