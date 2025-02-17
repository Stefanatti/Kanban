import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Subtask {
  _id?: string;
  title: string;
  completed?: boolean;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  completed?: boolean;
  subtasks?: Subtask[];
  listId: string;
}

export const tasksApi = createApi({
  reducerPath: "tasksApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/",
  }),
  tagTypes: ["Task"],
  endpoints: (builder) => ({
    // ✅ Create Task
    createTask: builder.mutation<Task, Partial<Task>>({
      query: (newTaskData) => ({
        url: "tasks",
        method: "POST",
        body: newTaskData,
      }),
      invalidatesTags: ["Task"],
    }),

    // ✅ Get Task by ID
    getTaskById: builder.query<Task, string>({
      query: (id) => ({ url: `tasks/${id}`, method: "GET" }),
      providesTags: ["Task"],
    }),

    // ✅ Update Task (Using PUT to match your API)
    updateTask: builder.mutation<void, { id: string; changes: Partial<Task> }>({
      query: ({ id, changes }) => ({
        url: `tasks/${id}`,
        method: "PUT", // ✅ Changed to PUT
        body: changes,
      }),
      invalidatesTags: ["Task"],
    }),

    // ✅ Delete Task
    deleteTask: builder.mutation<void, string>({
      query: (id) => ({ url: `tasks/${id}`, method: "DELETE" }),
      invalidatesTags: ["Task"],
    }),

    // ✅ Add a Subtask
    addSubtask: builder.mutation<Task, { taskId: string; subtask: Subtask }>({
      query: ({ taskId, subtask }) => ({
        url: `tasks/${taskId}/subtasks`,
        method: "POST",
        body: subtask,
      }),
      invalidatesTags: ["Task"],
    }),

    // ✅ Update a Subtask
    updateSubtask: builder.mutation<
      Task,
      { taskId: string; subtaskId: string; changes: Partial<Subtask> }
    >({
      query: ({ taskId, subtaskId, changes }) => ({
        url: `tasks/${taskId}/subtasks/${subtaskId}`,
        method: "PUT",
        body: changes,
      }),
      invalidatesTags: ["Task"],
    }),

    // ✅ Delete a Subtask
    deleteSubtask: builder.mutation<
      void,
      { taskId: string; subtaskId: string }
    >({
      query: ({ taskId, subtaskId }) => ({
        url: `tasks/${taskId}/subtasks/${subtaskId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Task"],
    }),
  }),
});

export const {
  useCreateTaskMutation,
  useGetTaskByIdQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useAddSubtaskMutation,
  useUpdateSubtaskMutation,
  useDeleteSubtaskMutation,
} = tasksApi;

// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// interface Task {
//   title: string;
//   description?: string;
//   dueDate?: Date;
//   completed?: Boolean;
//   subtasks?: string[];
//   _id: string;
// }

// export const tasksApi = createApi({
//   reducerPath: "tasksApi",
//   baseQuery: fetchBaseQuery({
//     baseUrl: "http://localhost:5000/",
//   }),
//   tagTypes: ["Task"],
//   endpoints: (builder) => ({
//     createTask: builder.mutation<Task, Partial<Task>>({
//       query: (newTaskData) => ({
//         url: "tasks",
//         method: "POST",
//         body: newTaskData,
//       }),
//       invalidatesTags: ["Task"],
//     }),
//     getTaskById: builder.query<Task, string>({
//       query: (id) => ({ url: `tasks/${id}`, method: "GET" }),
//       providesTags: ["Task"],
//     }),
//     updateTask: builder.mutation<void, { id: string; changes: Partial<Task> }>({
//       query: ({ id, changes }) => ({
//         url: `tasks/${id}`,
//         method: "PATCH",
//         body: changes,
//       }),
//       invalidatesTags: ["Task"],
//     }),
//     deleteTask: builder.mutation<void, string>({
//       query: (id) => ({ url: `tasks/${id}`, method: "DELETE" }),
//       invalidatesTags: ["Task"],
//     }),
//   }),
// });

// export const {
//   useCreateTaskMutation,
//   useGetTaskByIdQuery,
//   useUpdateTaskMutation,
//   useDeleteTaskMutation,
// } = tasksApi;
