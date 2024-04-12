import { NodePgDatabase } from 'drizzle-orm/node-postgres';

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
}
