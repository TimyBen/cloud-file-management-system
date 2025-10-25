declare namespace Express {
  export interface User {
    sub: string;
    email: string;
    role: string;
  }

  export interface Request {
    user?: User;
  }
  export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
  }
}
