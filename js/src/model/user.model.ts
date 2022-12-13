export interface UserApiDto {
  id: number;
  email: string;
  login: string;
  correction_point: number;
  pool_year: number;
  pool_month: number;
  wallet: number;
  'active?': boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  email: string;
  login: string;
  correctionPoint: number;
  poolYear: number;
  poolMonth: number;
  wallet: number;
  active: boolean;
  createdAt: string; // should use class..?
  updatedAt: string;
}
