export interface ILoginResponse {
  userId: string;
  email: string;
  username: string;
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}
