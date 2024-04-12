import {
  pgTable,
  serial,
  varchar,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';

export const taskStatus = pgEnum('task_status', [
  'open',
  'in_progress',
  'done',
]);

const tasks = pgTable('tasks', {
  id: serial('id').primaryKey().notNull(),
  title: varchar('title').notNull(),
  description: varchar('description').notNull(),
  assignee: varchar('assignee'),
  dueDate: varchar('due_date'),
  status: taskStatus('status').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export default tasks;

export type Task = InferSelectModel<typeof tasks>;
export type NewTask = InferInsertModel<typeof tasks>;
