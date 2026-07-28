"use client";
import * as React from "react";
import { useState, useEffect, FC } from "react";
import Container from "@mui/material/Container";
import { Box, Button, Typography, Stack, Paper, styled } from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  useGetBoardsQuery,
  useUpdateBoardMutation,
} from "@/lib/features/boardSlice";
import { useGetTaskByIdQuery } from "@/lib/features/tasksSlice";
import EditBoardModal from "./EditBoardModal";
import {
  useCreateListMutation,
  useDeleteListMutation,
} from "@/lib/features/listsSlice";
import { useUpdateTaskMutation } from "@/lib/features/tasksSlice";
import AddTaskModal from "./AddTaskModal";
import { Board, Task, List } from "@/app/interfaces/interfaces";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "grey",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  minHeight: "80vh",
  // width: "300px",
  textAlign: "center",
  color: theme.palette.text.secondary,
  ...theme.applyStyles("dark", {
    backgroundColor: "#1A2027",
  }),
}));

const TaskItem = styled(Paper)(({ theme }) => ({
  backgroundColor: "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: "center",
  color: theme.palette.text.secondary,
  ...theme.applyStyles("dark", {
    backgroundColor: "#1A2027",
  }),
}));

interface MainProps {
  selectedBoard: Board | undefined;
}

const Main: FC<MainProps> = ({ selectedBoard }) => {
  const [open, setOpen] = useState<boolean>(false);

  const [columnName, setColumnName] = useState<string>("");
  const [newColumnStatus, setNewColumnStatus] = useState<string>(""); // For new column selection

  const [openModal, setOpenModal] = useState<boolean>(false);
  const { data: boards, isLoading, isError } = useGetBoardsQuery();
  const [selectedBoardTitle, setSelectedBoardTitle] = useState<
    string | undefined
  >("");
  const [selectedBoardLists, setSelectedBoardLists] = useState<
    Array<List | undefined>
  >([]);

  const [boardId, setBoardId] = useState<string | undefined>("");

  const [createList] = useCreateListMutation();
  const [deleteList] = useDeleteListMutation();
  const [updateBoard] = useUpdateBoardMutation();
  const [updateTask] = useUpdateTaskMutation();

  // Task edit modal state
  const [editTaskModalOpen, setEditTaskModalOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setEditTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setEditTaskModalOpen(false);
    setSelectedTask(undefined);
  };

  const handleUpdateTask = async (taskId: string, changes: Partial<Task>) => {
    try {
      await updateTask({ id: taskId, changes }).unwrap();
      // Update local state to reflect changes
      setSelectedBoardLists((prevLists) =>
        prevLists.map((list) => {
          if (!list) return list;
          return {
            ...list,
            tasks: list.tasks?.map((task) =>
              task.id === taskId ? { ...task, ...changes } : task,
            ),
          };
        }),
      );
    } catch (err) {
      console.error("Failed to update task:", err);
      throw err;
    }
  };
  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen ?? !open);
  };

  useEffect(() => {
    if (selectedBoard) {
      setBoardId(selectedBoard.id);
      setSelectedBoardTitle(selectedBoard.title);
      setSelectedBoardLists(selectedBoard.lists || []);
    }
  }, [selectedBoard]);

  const handleEditBoardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    handleOpenModal();
  };

  const handleAddColumn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newColumnStatus) {
      console.error("No column status selected!");
      return;
    }

    const updatePromises = [];

    try {
      if (newColumnStatus && boardId) {
        // const newColumn = { title: columnName, boardId };
        const newColumn = {
          title: newColumnStatus as "To Do" | "Doing" | "Done",
          status: newColumnStatus,
          boardId,
        };

        const newList = await createList(newColumn).unwrap();

        setSelectedBoardLists((prevLists) => [...prevLists, newList]);

        // setColumnName("");
        setNewColumnStatus("To Do");
      }

      if (selectedBoardTitle && boardId) {
        const boardUpdate = updateBoard({
          id: boardId,
          changes: { title: selectedBoardTitle },
        }).unwrap();
        updatePromises.push(boardUpdate);
      }

      await Promise.all(updatePromises);

      setSelectedBoardTitle(selectedBoardTitle);
    } catch (err) {
      console.error("Failed to submit changes:", err);
    }
  };

  const deleteColumn = async (columnId: string) => {
    try {
      await deleteList(columnId).unwrap();
      const newLists = selectedBoardLists.filter(
        (list) => list?.id !== columnId,
      );
      setSelectedBoardLists(newLists);
    } catch (err) {
      console.error("Failed to delete column:", err);
    }
  };

  return (
    <Container maxWidth="xl">
      {!selectedBoard ? (
        <Box
          sx={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Stack spacing={2} alignItems="center">
            <Typography>
              Select a board from the sidebar or create a new one
            </Typography>
          </Stack>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
          }}
        >
          {selectedBoardLists.length ? (
            <>
              <Box
                sx={{
                  display: "flex",
                  gap: "20px",
                  mt: 3,
                  overflowX: "auto",
                  height: "100%",
                  padding: "10px",
                }}
              >
                {selectedBoardLists.map((list) => (
                  <Box
                    key={list?.id}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <Box>
                      <Typography sx={{ textAlign: "center" }}>
                        {list?.title}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        minWidth: "330px",
                        height: "95%",
                        backgroundColor: "#f5f5f5",
                        boxShadow: 1,
                        borderRadius: 2,
                        padding: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {list?.tasks?.map((task) => (
                        <TaskItem
                          key={task.id}
                          sx={{ cursor: "pointer" }}
                          onClick={() => handleTaskClick(task)}
                        >
                          <Typography sx={{ fontWeight: 600 }}>
                            {task.title}
                          </Typography>
                          {task.subtasks && task.subtasks.length > 0 && (
                            <Typography
                              variant="body2"
                              sx={{ color: "text.secondary", mt: 0.5 }}
                            >
                              0 of {task.subtasks.length} subtasks
                            </Typography>
                          )}
                        </TaskItem>
                      ))}
                    </Box>
                  </Box>
                ))}
                <Box
                  sx={{
                    width: "330px",
                    height: "95%",
                    mt: 3,
                    backgroundColor: "#f5f5f5",
                    boxShadow: 1,
                    borderRadius: 2,
                    p: 2,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {" "}
                  <Typography onClick={handleEditBoardClick}>
                    + New Column
                  </Typography>
                </Box>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Stack spacing={2} alignItems="center">
                <Typography>
                  This board is empty. Create a new column to get started
                </Typography>
                <Button
                  sx={{ borderRadius: "20px" }}
                  variant="contained"
                  onClick={handleOpenModal}
                >
                  + Add New Column
                </Button>
              </Stack>
            </Box>
          )}
        </Box>
      )}
      {openModal && (
        <div onClick={(e) => e.stopPropagation()}>
          <EditBoardModal
            open={true}
            handleClose={handleCloseModal}
            addColumn={handleAddColumn}
            boardCollumns={selectedBoardLists.filter(
              (list): list is List => list !== undefined,
            )}
            boardName={selectedBoardTitle}
            setBoardName={setSelectedBoardTitle}
            columnName={columnName}
            setColumnName={setColumnName}
            deleteColumn={deleteColumn}
            setNewColumnStatus={setNewColumnStatus}
            newColumnStatus={newColumnStatus}
          />
        </div>
      )}
      {editTaskModalOpen && selectedTask && (
        <div onClick={(e) => e.stopPropagation()}>
          <AddTaskModal
            open={true}
            handleClose={handleCloseTaskModal}
            selectedBoard={selectedBoard}
            addTask={async () => {}}
            newTaskName=""
            setNewTaskName={() => {}}
            editTask={selectedTask}
            onUpdateTask={handleUpdateTask}
          />
        </div>
      )}
    </Container>
  );
};

export default Main;
