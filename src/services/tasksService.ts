import { NewTask } from '../database/models/tasks';
import { TasksDb } from '../database/tasksDb';

import { InvalidParameterError } from '../errors/customErrors';

import { IUpdateTask } from '../interfaces/tasks';
export class TasksService {
  private tasksDb: TasksDb;

  constructor(tasksDb: TasksDb) {
    this.tasksDb = tasksDb;
  }

  create = async (newTask: NewTask) => {
    return this.tasksDb.createTask(newTask);
  };

  getListByUserId = async (userId: number) => {
    return await this.tasksDb.getTasks(userId);
  };

  updateTask = async (task: IUpdateTask) => {
    return await this.tasksDb.updateTask(task);
  };

  deleteTask = async (id: number) => {
    const workSpace = await this.tasksDb.getTaskById(id);

    if (!workSpace) {
      throw new InvalidParameterError(`Task with id ${id} not found`);
    }

    await this.tasksDb.deleteTask(id);

    return true;
  };
}
