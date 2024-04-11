import { RequestHandler, CookieOptions, Response } from 'express';
import axios from 'axios';
import queryString from 'querystring';

import { Controller } from './Controller';

import { signUpSchema } from '../dto/user';

import { AuthService } from '../services/authService';

import { AuthMiddlewares } from '../middlewares/authMiddlewares';

import {
  InvalidParameterError,
  RefreshTokenError,
} from '../errors/customErrors';

import { GeneratedAuthTokens, IUser } from '../interfaces/auth';

export class AuthController extends Controller {
  authService: AuthService;
  authMiddlewares: AuthMiddlewares;

  constructor(authService: AuthService, authMiddlewares: AuthMiddlewares) {
    super('/auth');

    this.authMiddlewares = authMiddlewares;
    this.authService = authService;

    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/google', this.link({ route: this.googleAuth }));
    this.router.get(
      '/google-redirect',
      this.link({ route: this.googleRedirect })
    );
    this.router.post('/sign-up', this.link({ route: this.signUp }));
    this.router.post('/login', this.link({ route: this.logIn }));
    this.router.get(
      '/me',
      this.authMiddlewares.isAuthorized,
      this.link({ route: this.getMe })
    );
    this.router.get('/refresh', this.link({ route: this.refreshAccessToken }));
    this.router.get(
      '/logout',
      this.authMiddlewares.isAuthorized,
      this.link({ route: this.logOut })
    );
  }

  private googleAuth: RequestHandler<{}, {}> = async (req, res) => {
    const stringifiedParams = queryString.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: `${process.env.BASE_URL}/auth/google-redirect`,
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ].join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
    });

    return res.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`
    );
  };

  private googleRedirect: RequestHandler<{}, {}> = async (req, res) => {
    const code = req.query.code;

    try {
      const tokenData = await axios({
        url: `https://oauth2.googleapis.com/token`,
        method: 'post',
        data: {
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: `${process.env.BASE_URL}/auth/google-redirect`,
          grant_type: 'authorization_code',
          code,
        },
      });

      const userData = await axios({
        url: 'https://www.googleapis.com/oauth2/v2/userinfo',
        method: 'get',
        headers: {
          Authorization: `Bearer ${tokenData.data.access_token}`,
        },
      });

      const { accessToken, refreshToken } = await this.authService.googleLogIn(
        userData.data.email
      );
      this.setCookies({ res, accessToken, refreshToken });

      return res.redirect(`${process.env.FE_BASE_URL}`);
    } catch (error) {
      console.log(error);
    }
  };

  private signUp: RequestHandler<{}, IUser> = async (req, res) => {
    const validatedBody = signUpSchema.safeParse(req.body);

    if (!validatedBody.success) {
      throw new InvalidParameterError('Bad request');
    }

    const { accessToken, refreshToken, ...newUser } =
      await this.authService.signUp(req.body);
    this.setCookies({ res, accessToken, refreshToken });

    return res.status(201).json(newUser);
  };

  private logIn: RequestHandler<{}, IUser> = async (req, res, next) => {
    try {
      const validatedBody = signUpSchema.safeParse(req.body);

      if (!validatedBody.success) {
        throw new InvalidParameterError('Bad request');
      }

      const { accessToken, refreshToken, ...user } =
        await this.authService.logIn(req.body);
      this.setCookies({ res, accessToken, refreshToken });

      return res.status(200).json(user);
    } catch (e) {
      next(e);
    }
  };

  private getMe: RequestHandler<{}, IUser> = async (req, res, next) => {
    try {
      //@ts-ignore
      const user = req.user as IUser;

      return res.status(200).json(user);
    } catch (e) {
      next(e);
    }
  };

  private refreshAccessToken: RequestHandler<{}, GeneratedAuthTokens> = async (
    req,
    res,
    next
  ) => {
    try {
      const reqRefreshToken = req.cookies['refreshToken'];

      if (!reqRefreshToken)
        throw new RefreshTokenError("Can't find refresh token");

      const { accessToken, refreshToken } =
        await this.authService.refreshTokens(reqRefreshToken);
      this.setCookies({ res, accessToken, refreshToken });

      return res.status(201).json({ accessToken, refreshToken });
    } catch (e) {
      next(e);
    }
  };

  private logOut: RequestHandler<{}, boolean> = async (req, res, next) => {
    try {
      const response = this.clearCookies(res);

      return response.status(200).json(true);
    } catch (e) {
      next(e);
    }
  };

  private setCookies = ({
    res,
    accessToken,
    refreshToken,
  }: {
    res: Response;
    accessToken: string;
    refreshToken: string;
  }): Response => {
    const expireAccessToken = new Date();
    expireAccessToken.setHours(expireAccessToken.getHours() + 1);

    const expireRefreshToken = new Date();
    expireRefreshToken.setHours(expireRefreshToken.getHours() + 7 * 24);

    const options: CookieOptions = {
      secure: true,
      httpOnly: false,
      sameSite: 'none',
    };

    res.cookie('accessToken', accessToken, {
      ...options,
      expires: expireAccessToken,
    });

    res.cookie('refreshToken', refreshToken, {
      ...options,
      expires: expireRefreshToken,
    });

    return res;
  };

  private clearCookies = (res: Response): Response => {
    const options: CookieOptions = {
      secure: true,
      httpOnly: false,
      sameSite: 'none',
    };

    res.clearCookie('accessToken', options);
    res.clearCookie('refreshToken', options);

    return res;
  };
}
