import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { asc, eq } from 'drizzle-orm';

import tasks, { NewTask } from './models/tasks';

import { IUpdateTask } from '../interfaces/tasks';

export class TasksDb {
  constructor(private db: NodePgDatabase) {}

  public createTask = async (newTask: NewTask) => {
    return this.db
      .insert(tasks)
      .values(newTask)
      .returning()
      .then(res => res[0]);
  };

  public getTasks = async (userId: number) => {
    return this.db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(asc(tasks.createdAt));
  };

  public updateTask = async (task: IUpdateTask) =>
    this.db
      .update(tasks)
      .set({
        title: task.title,
        description: task.description,
        assignee: task.assignee,
        dueDate: task.dueDate,
        status: task.status,
      })
      .where(eq(tasks.id, task.id))
      .returning()
      .then(res => res[0]);

  public getTaskById = async (id: number) =>
    this.db.select().from(tasks).where(eq(tasks.id, id));

  public deleteTask = async (id: number) =>
    this.db.delete(tasks).where(eq(tasks.id, id));
}
