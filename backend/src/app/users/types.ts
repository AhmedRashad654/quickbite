import { SystemRole } from './enums.js';

export interface User {
  id: number;
  email: string;
  phone: string;
  name: string;
  password_hash: string;
  system_role: SystemRole;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  
}

export interface CreateUserData {
  email: string;
  phone: string;
  name: string;
  password: string;
  system_role: SystemRole;
}
