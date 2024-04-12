import { z } from 'zod';

import { EStatus } from '../interfaces/tasks';

export const createTaskSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    assignee: z.string().optional(),
    dueDate: z.coerce.date().optional(),
    status: z.nativeEnum(EStatus),
    userId: z.coerce.number(),
  })
  .strict();

export const getTasksSchema = z
  .object({
    userId: z.coerce.number(),
  })
  .strict();

export const updateTasksSchema = z
  .object({
    id: z.coerce.number(),
    title: z.string(),
    description: z.string(),
    assignee: z.string().optional(),
    dueDate: z.coerce.date().optional(),
    status: z.nativeEnum(EStatus),
  })
  .strict();

export const deleteTaskSchema = z
  .object({
    id: z.coerce.number(),
  })
  .strict();
