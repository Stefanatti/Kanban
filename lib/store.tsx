import { configureStore } from "@reduxjs/toolkit";
import { boardsApi } from "./features/boardSlice";
import { tasksApi } from "./features/tasksSlice";
import { listsApi } from "./features/listsSlice";
export const makeStore = () => {
  return configureStore({
    reducer: {
      [boardsApi.reducerPath]: boardsApi.reducer,
      [listsApi.reducerPath]: listsApi.reducer,

      [tasksApi.reducerPath]: tasksApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        boardsApi.middleware,
        listsApi.middleware,
        tasksApi.middleware
      ),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
