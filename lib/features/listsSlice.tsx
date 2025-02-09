import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface List {
  _id: string;
  title: "To Do" | "Doing" | "Done";
  tasks?: { _id: string; title: string }[];
  boardId?: string;
  //   createdAt?: string;
  //   updatedAt?: string;
}

export const listsApi = createApi({
  reducerPath: "listsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/",
  }),
  tagTypes: ["List"],
  endpoints: (builder) => ({
    getListsByBoardId: builder.query<List[], string>({
      query: (boardId) => `lists?boardId=${boardId}`,
      providesTags: ["List"],
    }),
    createList: builder.mutation<List, Partial<List>>({
      query: (newListData) => ({
        url: "lists",
        method: "POST",
        body: newListData,
      }),
      invalidatesTags: ["List"],
    }),
    getListById: builder.query<List, string>({
      query: (id) => ({ url: `lists/${id}`, method: "GET" }),
      providesTags: ["List"],
    }),
    updateList: builder.mutation<void, { id: string; changes: Partial<List> }>({
      query: ({ id, changes }) => ({
        url: `lists/${id}`,
        method: "PATCH",
        body: changes,
      }),
      invalidatesTags: ["List"],
    }),
    deleteList: builder.mutation<void, string>({
      query: (id) => ({ url: `lists/${id}`, method: "DELETE" }),
      invalidatesTags: ["List"],
    }),
  }),
});

export const {
  useGetListsByBoardIdQuery,
  useCreateListMutation,
  useGetListByIdQuery,
  useUpdateListMutation,
  useDeleteListMutation,
} = listsApi;
