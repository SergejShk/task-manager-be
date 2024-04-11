import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';
import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';

const users = pgTable('users', {
  id: serial('id').primaryKey().notNull(),
  email: varchar('email').notNull(),
  password: varchar('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export default users;

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
