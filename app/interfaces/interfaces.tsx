export interface Task {
  title: string;
  description?: string;
  dueDate?: Date;
  completed?: boolean;
  subtasks?: string[];
  _id: string;
}

export interface List {
  _id: string;
  title: string;
  tasks?: Task[];
  boardId?: string;
}

export interface Board {
  createdAt: string;
  title: string;
  lists?: List[];
  updatedAt: string;
  __v: number;
  _id: string;
}
