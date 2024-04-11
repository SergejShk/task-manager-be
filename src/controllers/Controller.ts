import { RequestHandler, Router } from 'express';
import 'dotenv/config';

import { CustomError } from '../errors/customErrors';

export abstract class Controller {
  public readonly router: Router;

  constructor(public path: string) {
    this.router = Router();
  }

  public link = ({ route }: { route: any }): RequestHandler => {
    return async (req, res, next) => {
      try {
        await route(req, res, next);
      } catch (error: any) {
        if (error instanceof CustomError) {
          return res.status(error.status).json(error.message);
        }
        return res.status(500).json('Internal server error');
      }
    };
  };
}
