// types/employee.ts

export interface Role {
  id: string;
  name: string;
  description?: string | null;
  icon: string;
  color: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role_id: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at?: string | null;
}