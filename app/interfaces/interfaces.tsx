export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  title: string;
  description?: string;
  dueDate?: Date;
  completed?: boolean;
  subtasks?: Subtask[];
  id: string;
  listId?: string;
}

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
