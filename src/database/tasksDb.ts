import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { asc, eq } from 'drizzle-orm';

import tasks, { NewTask } from './models/tasks';

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
}
