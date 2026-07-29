"use client";
import styles from "./page.module.css";
import KanbanBar from "./components/KanbanBar";
import Main from "./components/Main";
import SideBar from "./components/SideDrawer";
import DeleteBoardModal from "./components/DeleteBoardModal";
import {
  useGetBoardByIdQuery,
  useGetBoardsQuery,
  useDeleteBoardMutation,
} from "@/lib/features/boardSlice";
import { useState, useRef } from "react";
import { Board } from "@/app/interfaces/interfaces";

export default function Home() {
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteBoard] = useDeleteBoardMutation();

  // Ref to trigger edit modal from KanbanBar → Main
  const editBoardRef = useRef<() => void>(() => {});

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
  };

  const handleDeleteBoard = async () => {
    if (!selectedBoardId) return;
    try {
      await deleteBoard(selectedBoardId).unwrap();
      setSelectedBoardId(null);
    } catch (err) {
      console.error("Failed to delete board:", err);
    }
  };

  return (
    <div className={styles.page}>
      <KanbanBar
        selectedBoard={selectedBoard}
        onEditBoard={() => editBoardRef.current()}
        onDeleteBoard={() => setDeleteModalOpen(true)}
      />
      <Main
        selectedBoard={selectedBoard}
        onRegisterEditBoard={(fn) => {
          editBoardRef.current = fn;
        }}
      />
      <SideBar boards={boards} onBoardSelect={handleBoardSelection} />
      {deleteModalOpen && selectedBoard && (
        <DeleteBoardModal
          open={true}
          handleClose={() => setDeleteModalOpen(false)}
          boardName={selectedBoard.title}
          onDelete={handleDeleteBoard}
        />
      )}
    </div>
  );
}
