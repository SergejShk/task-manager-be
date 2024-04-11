export enum Token {
  Access = 'access',
  Refresh = 'refresh',
}

export interface GeneratedAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IUser {
  id: number;
  email: string;
}

export interface JwtData extends IUser {
  tokenType: Token;
}

export interface ISignUpBody {
  email: string;
  password: string;
}
