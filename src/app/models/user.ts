export interface User {
  token: string;
  tokeType: string;
  email: string;
  role: 'ROLE_ADMIN' | 'ROLE_TEACHER';
}
