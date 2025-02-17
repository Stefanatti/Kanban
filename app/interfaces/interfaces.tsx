// Interface for a Subtask
export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

// Interface for a Task
export interface Task {
  title: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  subtasks?: string[];
  _id: string;
}

export interface List {
  _id: string;
  title: string;
  tasks?: { _id: string; title: string }[];
  boardId?: string;
}

export interface Board {
  createdAt: string;
  title?: string;
  lists?: {
    title: string;
    _id: string;
    tasks?: Task[];
  }[];
  updatedAt: string;
  __v: number;
  _id?: string;
}
