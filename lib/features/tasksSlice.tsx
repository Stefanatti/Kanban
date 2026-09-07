import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Task, TaskUpdateInput } from "@/app/interfaces/interfaces";

interface CreateTaskInput {
  title: string;
  listId: string;
  description?: string;
  subtasks?: { title: string }[];
  dueDate?: string | null;
  reminderMinutesBefore?: number | null;
  timezone?: string;
}

export const tasksApi = createApi({
  reducerPath: "tasksApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
  }),
  tagTypes: ["Task"],
  endpoints: (builder) => ({
    createTask: builder.mutation<Task, CreateTaskInput>({
      query: (newTaskData) => ({
        url: "tasks",
        method: "POST",
        body: newTaskData,
      }),
      invalidatesTags: ["Task"],
    }),
    getTaskById: builder.query<Task, string>({
      query: (id) => ({ url: `tasks/${id}`, method: "GET" }),
      providesTags: ["Task"],
    }),
    updateTask: builder.mutation<
      Task,
      { id: string; changes: TaskUpdateInput }
    >({
      query: ({ id, changes }) => ({
        url: `tasks/${id}`,
        method: "PATCH",
        body: changes,
      }),
      invalidatesTags: ["Task"],
    }),
    deleteTask: builder.mutation<void, string>({
      query: (id) => ({ url: `tasks/${id}`, method: "DELETE" }),
      invalidatesTags: ["Task"],
    }),
  }),
});

export const {
  useCreateTaskMutation,
  useGetTaskByIdQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApi;
