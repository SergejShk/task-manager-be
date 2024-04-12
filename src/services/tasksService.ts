import { NewTask } from '../database/models/tasks';
import { TasksDb } from '../database/tasksDb';

import { InvalidParameterError } from '../errors/customErrors';

import { IStatistic, IUpdateTask } from '../interfaces/tasks';
export class TasksService {
  private tasksDb: TasksDb;

  constructor(tasksDb: TasksDb) {
    this.tasksDb = tasksDb;

    this.setupGetWeek();
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

  tasksStatistic = async (userId: number) => {
    const tasks = await this.getListByUserId(userId);

    return tasks.reduce<IStatistic>(
      (acc, { status, assignee, dueDate }) => {
        //  @ts-ignore
        const week = dueDate ? `week${dueDate.getWeek()}` : null;

        return {
          status: acc.status[status]
            ? { ...acc.status, [status]: acc.status[status] + 1 }
            : { ...acc.status, [status]: 1 },
          assignee:
            assignee && acc.assignee[assignee]
              ? { ...acc.assignee, [assignee]: acc.assignee[assignee] + 1 }
              : assignee
              ? { ...acc.assignee, [assignee]: 1 }
              : { ...acc.assignee },
          dueDate:
            week && acc.dueDate[week]
              ? { ...acc.dueDate, [week]: acc.dueDate[week] + 1 }
              : week
              ? { ...acc.dueDate, [week]: 1 }
              : { ...acc.dueDate },
        };
      },
      { status: {}, assignee: {}, dueDate: {} }
    );
  };

  private setupGetWeek = () => {
    //  @ts-ignore
    Date.prototype.getWeek = function () {
      const date = new Date(this.getTime());
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
      const week1 = new Date(date.getFullYear(), 0, 4);

      return (
        1 +
        Math.round(
          ((date.getTime() - week1.getTime()) / 86400000 -
            3 +
            ((week1.getDay() + 6) % 7)) /
            7
        )
      );
    };
  };
}
