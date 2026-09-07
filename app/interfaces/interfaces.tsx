export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface TaskReminder {
  id: string;
  remindAt: string | Date;
  sentAt?: string | Date | null;
  cancelledAt?: string | Date | null;
}

export interface ReminderSettingsInput {
  reminderMinutesBefore?: number | null;
  timezone?: string;
}

export interface Task {
  title: string;
  description?: string;
  dueDate?: string | Date | null;
  completed?: boolean;
  subtasks?: Subtask[];
  reminders?: TaskReminder[];
  id: string;
  listId?: string;
}

export type TaskUpdateInput = Partial<Task> & ReminderSettingsInput;

export interface List {
  id: string;
  title: string;
  tasks?: Task[];
  boardId?: string;
}

export interface Board {
  createdAt: string;
  title: string;
  lists?: List[];
  updatedAt: string;
  id: string;
}
