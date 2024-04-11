import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { UsersDb } from '../database/usersDb';

import {
  DuplicateError,
  InvalidParameterError,
  RefreshTokenError,
} from '../errors/customErrors';

import {
  GeneratedAuthTokens,
  ISignUpBody,
  IUser,
  JwtData,
  Token,
} from '../interfaces/auth';

export class AuthService {
  private usersDb: UsersDb;

  constructor(usersDb: UsersDb) {
    this.usersDb = usersDb;
  }

  getToken = (data: IUser, tokenType: Token) => {
    const payload = {
      id: data.id,
      email: data.email,
      tokenType,
    };

    return jwt.sign(payload, process.env.JWT_SECRET || '', {
      expiresIn: tokenType === Token.Refresh ? '24h' : '1h',
    });
  };

  googleLogIn = async (email: string) => {
    const user = await this.usersDb.getUserByEmail(email);

    if (user.length) {
      const payloadToken = {
        id: user[0].id,
        email: user[0].email,
      };

      const accessToken = this.getToken(payloadToken, Token.Access);
      const refreshToken = this.getToken(payloadToken, Token.Refresh);

      return { ...payloadToken, accessToken, refreshToken };
    }

    const [response] = await this.usersDb.createUser({
      email,
    });

    const payloadToken = {
      id: response.id,
      email: response.email,
    };

    const accessToken = this.getToken(payloadToken, Token.Access);
    const refreshToken = this.getToken(payloadToken, Token.Refresh);

    return { ...payloadToken, accessToken, refreshToken };
  };

  signUp = async (body: ISignUpBody) => {
    const { email } = body;
    const user = await this.usersDb.getUserByEmail(email);

    if (user[0]?.password) {
      throw new DuplicateError('User already exists');
    }

    if (user.length) {
      const hashedPassword = await bcrypt.hash(body.password, 10);
      const response = await this.usersDb.updateUserPassword({
        ...user[0],
        password: hashedPassword,
      });

      const payloadToken = {
        id: response.id,
        email: response.email,
      };

      const accessToken = this.getToken(payloadToken, Token.Access);
      const refreshToken = this.getToken(payloadToken, Token.Refresh);

      return { ...payloadToken, accessToken, refreshToken };
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    const [response] = await this.usersDb.createUser({
      ...body,
      password: hashedPassword,
    });

    const payloadToken = {
      id: response.id,
      email: response.email,
    };

    const accessToken = this.getToken(payloadToken, Token.Access);
    const refreshToken = this.getToken(payloadToken, Token.Refresh);

    return { ...payloadToken, accessToken, refreshToken };
  };

  logIn = async (body: ISignUpBody) => {
    const { email, password: reqPassword } = body;
    const [user] = await this.usersDb.getUserByEmail(email);

    if (!user?.password) {
      throw new InvalidParameterError('Email or password is wrong');
    }

    if (!user || !(await bcrypt.compare(reqPassword, user.password))) {
      throw new InvalidParameterError('Email or password is wrong');
    }

    const { password, ...response } = user;
    const payloadToken = {
      id: response.id,
      email: response.email,
    };

    const accessToken = this.getToken(payloadToken, Token.Access);
    const refreshToken = this.getToken(payloadToken, Token.Refresh);

    return { ...response, accessToken, refreshToken };
  };

  refreshTokens = async (token: string): Promise<GeneratedAuthTokens> => {
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET || ''
    ) as JwtData;

    if (decodedToken.tokenType !== Token.Refresh)
      throw new RefreshTokenError('Refresh token error');

    const [user] = await this.usersDb.getUserById(decodedToken.id);

    if (!user) {
      throw new RefreshTokenError(`Can't find user by refresh token`);
    }

    const payloadToken = {
      id: user.id,
      email: user.email,
    };

    const accessToken = this.getToken(payloadToken, Token.Access);
    const refreshToken = this.getToken(payloadToken, Token.Refresh);

    return { accessToken, refreshToken };
  };
}
