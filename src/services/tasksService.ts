import { NewTask } from '../database/models/tasks';
import { TasksDb } from '../database/tasksDb';

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
}
