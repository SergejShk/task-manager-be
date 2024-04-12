import { RequestHandler } from 'express';

import { Controller } from './Controller';

import { Task } from '../database/models/tasks';

import { TasksService } from '../services/tasksService';

import {
  createTaskSchema,
  deleteTaskSchema,
  getTasksSchema,
  updateTasksSchema,
} from '../dto/task';

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
    this.router.get(
      '/',
      this.authMiddlewares.isAuthorized,
      this.link({ route: this.getTasksList })
    );
    this.router.put(
      '/:id',
      this.authMiddlewares.isAuthorized,
      this.link({ route: this.updateTask })
    );
    this.router.delete(
      '/:id',
      this.authMiddlewares.isAuthorized,
      this.link({ route: this.deleteTask })
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

  private getTasksList: RequestHandler<{}, Task[]> = async (req, res) => {
    //  @ts-ignore
    const user = req.user as IUser;
    const validatedBody = getTasksSchema.safeParse({
      userId: user.id,
    });

    if (!validatedBody.success) {
      throw new InvalidParameterError('Bad request');
    }

    const tasks = await this.tasksService.getListByUserId(
      validatedBody.data.userId
    );

    return res.status(200).json(tasks);
  };

  private updateTask: RequestHandler<{ id: string }, Task> = async (
    req,
    res
  ) => {
    const validatedBody = updateTasksSchema.safeParse({
      ...req.body,
      id: req.params.id,
    });

    if (!validatedBody.success) {
      throw new InvalidParameterError('Bad request');
    }

    const task = await this.tasksService.updateTask(validatedBody.data);

    return res.status(200).json(task);
  };

  private deleteTask: RequestHandler<{ id: string }, boolean> = async (
    req,
    res
  ) => {
    const validatedBody = deleteTaskSchema.safeParse({
      id: req.params.id,
    });

    if (!validatedBody.success) {
      throw new InvalidParameterError('Bad request');
    }

    const isDeleted = await this.tasksService.deleteTask(validatedBody.data.id);

    return res.status(200).json(isDeleted);
  };
}
