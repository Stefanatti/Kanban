"use client";
import styles from "./page.module.css";
import KanbanBar from "./components/KanbanBar";
import Main from "./components/Main";
import SideBar from "./components/SideDrawer";
import {
  useGetBoardByIdQuery,
  useGetBoardsQuery,
} from "@/lib/features/boardSlice";
import { useState } from "react";
import { Board } from "@/app/interfaces/interfaces";

export default function Home() {
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  const { data: boards, isLoading, isError } = useGetBoardsQuery();
  console.log(boards);

  const {
    data: selectedBoard,
    isLoading: selectedBoardisLoading,
    isError: selectedBoardIsError,
  } = useGetBoardByIdQuery(selectedBoardId || "", {
    skip: !selectedBoardId,
  });

  const handleBoardSelection = (boardId: string) => {
    setSelectedBoardId(boardId);
    return () => {};
  };

  return (
    <div className={styles.page}>
      <KanbanBar selectedBoard={selectedBoard} />
      <Main selectedBoard={selectedBoard} />
      <SideBar boards={boards} onBoardSelect={handleBoardSelection} />
    </div>
  );
}
