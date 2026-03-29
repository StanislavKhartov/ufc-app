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
    .eq('is_deleted', false) // ПОКАЗЫВАТЬ ТОЛЬКО ЖИВЫХ
    .order('full_name');
  return data || [];
}

// 2. Изменяем получение матчей
async getMatches() {
  const { data } = await this.supabase
    .from('matches')
    .select(`*, fighter1:fighters!fighter_1_id(full_name), fighter2:fighters!fighter_2_id(full_name)`)
    .eq('is_deleted', false) // ПОКАЗЫВАТЬ ТОЛЬКО ЖИВЫХ
    .order('event_date', { ascending: false });
  return data || [];
}

// 3. Изменяем удаление (Теперь это МЯГКОЕ удаление)
async delete(table: string, id: string) {
  return await this.supabase
    .from(table)
    .update({ is_deleted: true }) // Вместо .delete() делаем .update()
    .eq('id', id);
}

// 4. При сохранении записываем last_modified_id
async save(table: string, item: any) {
  // Если у записи уже есть ID, значит это РЕДАКТИРОВАНИЕ
  if (item.id) {
    const oldId = item.id;

    // ШАГ 1: "Удаляем" старую сущность
    await this.supabase
      .from(table)
      .update({ is_deleted: true })
      .eq('id', oldId);

    // ШАГ 2: Подготавливаем данные для НОВОЙ сущности
    // Убираем текущий ID (чтобы база создала новый хэш)
    // И записываем oldId в поле last_modified_id
    const { id, fighter1, fighter2, ...newData } = item; 
    
    const payload = {
      ...newData,
      is_deleted: false,
      last_modified_id: oldId // Ссылка на "родительскую" версию
    };

    // ШАГ 3: Вставляем как новую запись
    return await this.supabase.from(table).insert(payload).select();
  } 
  
  // Если ID нет, значит это просто создание НОВОЙ записи с нуля
  else {
    return await this.supabase.from(table).insert(item).select();
  }
}
}