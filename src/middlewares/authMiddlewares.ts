import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { UsersDb } from '../database/usersDb';

import { CustomError, UnauthorizedError } from '../errors/customErrors';

import { GeneratedAuthTokens, IUser, JwtData } from '../interfaces/auth';

export class AuthMiddlewares {
  constructor(private usersDb: UsersDb) {
    this.usersDb = usersDb;
  }

  public isAuthorized = async (
    req: Request,
    _: Response,
    next: NextFunction
  ) => {
    try {
      const cookies = req.cookies;

      if (!cookies && !(cookies as GeneratedAuthTokens)?.accessToken)
        throw new CustomError("Can't find access token");

      const token = cookies.accessToken;

      const decodedUser = jwt.verify(
        token,
        process.env.JWT_SECRET || ''
      ) as JwtData;

      const [response] = await this.usersDb.getUserById(decodedUser.id);

      if (!response) {
        return next(new UnauthorizedError('Not authorized'));
      }

      const { password, createdAt, ...user } = response;

      //@ts-ignore
      req.user = user as IUser;
      next();
      return;
    } catch (error) {
      next(new UnauthorizedError('Not authorized'));
    }
  };
}
