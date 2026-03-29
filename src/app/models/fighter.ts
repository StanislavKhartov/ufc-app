export interface Fighter {
 id: string;
  full_name: string;
  height_cm: number;
  weight_kg: number;
  bio: string;
  is_deleted: boolean;    
  last_modified_id?: string; 
}