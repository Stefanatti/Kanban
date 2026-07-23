import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Board } from "@/app/interfaces/interfaces";

export const boardsApi = createApi({
  reducerPath: "boardsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
  }),
  tagTypes: ["Board"],
  endpoints: (builder) => ({
    getBoards: builder.query<Board[], void>({
      query: () => "boards",
      providesTags: ["Board"],
    }),
    createBoard: builder.mutation<Board, Partial<Board>>({
      query: (newBoardData) => ({
        url: "boards",
        method: "POST",
        body: newBoardData,
      }),
      invalidatesTags: ["Board"], // Add this line
    }),
    getBoardById: builder.query<Board, string>({
      query: (id) => ({ url: `boards/${id}`, method: "GET" }),
      providesTags: ["Board"],
    }),
    updateBoard: builder.mutation<
      void,
      { id: string; changes: Partial<Board> }
    >({
      query: ({ id, changes }) => ({
        url: `boards/${id}`,
        method: "PUT",
        body: changes,
      }),
      invalidatesTags: ["Board"],
    }),
    deleteBoard: builder.mutation<void, string>({
      query: (id) => ({ url: `boards/${id}`, method: "DELETE" }),
      invalidatesTags: ["Board"],
    }),
  }),
});

export const {
  useGetBoardsQuery,
  useCreateBoardMutation,
  useGetBoardByIdQuery,
  useUpdateBoardMutation,
  useDeleteBoardMutation,
} = boardsApi;
