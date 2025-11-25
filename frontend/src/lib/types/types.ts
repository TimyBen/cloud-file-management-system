// src/lib/types.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: IUser;
}

export interface IUser {
  id: string;
  email: string;
  name?: string;
  roles?: string[];
  [k: string]: any;
}

/* File and share interfaces (optional) */
export interface IFile {
  id: string;
  name: string;
  size?: number;
  mime?: string;
  url?: string;
  createdAt?: string;
  [k: string]: any;
}

export interface IShare {
  id: string;
  fileId: string;
  link: string;
  expiresAt?: string;
  permissions?: string[];
}
