export type LoginRequest = { email: string; password: string };
export type LoginResponse = { token: string; user: any };

export type RegisterRequest = { name: string; email: string; password: string };
export type RegisterResponse = { token?: string; user?: any };

export type StatsResponse = {
  storage: { used: number; total: number };
  totalFiles: number;
  sharedItems: number;
  sharedWith: number;
  activityToday: number;
};

export type FileItem = {
  id: string;
  name: string;
  size?: string;
  mime?: string;
  isDirectory?: boolean;
  modifiedAgo?: string;
};

export type StorageUsageResponse = {
  percent: number;
  breakdown: { label: string; size: number }[];
};

export type WeeklyActivityResponse = {
  labels: string[];
  values: number[];
};
