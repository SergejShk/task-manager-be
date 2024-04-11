import express, { Application, Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { Controller } from './controllers/Controller';

export default class App {
  public readonly app: Application;

  constructor(private port: number, private controllers: Controller[]) {
    this.app = express();

    this.initializeMiddlwares();
    this.initializeControllers();
  }

  private initializeMiddlwares = () => {
    this.app.use(cookieParser());
    this.app.use(
      express.json({
        verify: (req, _, buf) => {
          (req as any).rawBody = buf.toString();
        },
        limit: '10mb',
      })
    );

    this.app.use(
      cors({
        origin: [process.env.FE_BASE_URL || ''],
        methods: ['GET', 'PATCH', 'POST', 'DELETE', 'OPTIONS', 'PUT', 'HEAD'],
        preflightContinue: false,
        optionsSuccessStatus: 204,
        exposedHeaders: 'X-Total-Count',
        credentials: true,
      })
    );
  };

  private initializeControllers = () => {
    this.controllers.forEach(controller => {
      this.app.use(controller.path, controller.router);
    });
  };

  public listen = () => {
    this.app.use(
      async (err: Error, _: Request, res: Response, next: NextFunction) => {
        res
          .status((err as any)?.status || 500)
          .send(err?.message || 'Bad request');
        return next(err);
      }
    );
    // starting app
    this.app.listen(this.port, async () => {
      console.log(`The server is running on port ${this.port}`);
    });
  };
}
