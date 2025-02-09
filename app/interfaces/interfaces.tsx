// Interface for a Subtask
export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

// Interface for a Task
export interface Task {
  id: string;
  title: string;
  description?: string;
  subtasks: Subtask[];
  status: string; // Could reference the status name from the list it belongs to
}

// Interface for a List
export interface List {
  id: string;
  name: string; // e.g., "To Do", "In Progress", "Done"
  tasks: Task[];
}

// Interface for a Board
// export interface Board {
//   id: string;
//   name: string; // e.g., "Project Alpha"
//   lists: List[];
// }

// Optional: Root type for all boards (if you manage multiple boards)
// export interface KanbanData {
//   boards: Board[];
// }
