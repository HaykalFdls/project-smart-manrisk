export interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  unit_id: number; 
  status: string;
  role_name?: string;
  unit_name?: string; 
}
