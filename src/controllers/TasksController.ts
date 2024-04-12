import { RequestHandler } from 'express';

import { Controller } from './Controller';

import { Task } from '../database/models/tasks';

import { TasksService } from '../services/tasksService';

import { createTaskSchema } from '../dto/task';

import { AuthMiddlewares } from '../middlewares/authMiddlewares';

import { InvalidParameterError } from '../errors/customErrors';

export class TasksController extends Controller {
  tasksService: TasksService;
  authMiddlewares: AuthMiddlewares;

  constructor(tasksService: TasksService, authMiddlewares: AuthMiddlewares) {
    super('/tasks');

    this.authMiddlewares = authMiddlewares;
    this.tasksService = tasksService;

    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/',
      this.authMiddlewares.isAuthorized,
      this.link({ route: this.createTask })
    );
  }

  private createTask: RequestHandler<{}, Task> = async (req, res) => {
    //  @ts-ignore
    const user = req.user as IUser;
    const validatedBody = createTaskSchema.safeParse({
      ...req.body,
      userId: user.id,
    });

    if (!validatedBody.success) {
      throw new InvalidParameterError('Bad request');
    }

    const createdTask = await this.tasksService.create(validatedBody.data);

    return res.status(201).json(createdTask);
  };
}
