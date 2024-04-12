export enum EStatus {
  Open = 'open',
  InProgress = 'in_progress',
  Done = 'done',
}

export interface IUpdateTask {
  id: number;
  title: string;
  description: string;
  assignee?: string;
  dueDate?: Date;
  status: EStatus;
}
