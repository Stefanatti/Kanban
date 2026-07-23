import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Task } from "@/app/interfaces/interfaces";

export const tasksApi = createApi({
  reducerPath: "tasksApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/",
  }),
  tagTypes: ["Task"],
  endpoints: (builder) => ({
    createTask: builder.mutation<Task, Partial<Task>>({
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
    updateTask: builder.mutation<void, { id: string; changes: Partial<Task> }>({
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
