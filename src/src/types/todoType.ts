export type TaskStatus = string;

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: Date;
  completedAt: Date | undefined;
  reminderAt: Date | undefined;
}

export interface Column {
  id: TaskStatus;
  title: string;
}
