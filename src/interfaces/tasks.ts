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

export type IStatisticItem = {
  [key in string]: number;
};

export interface IStatistic {
  status: IStatisticItem;
  assignee: IStatisticItem;
  dueDate: IStatisticItem;
}
