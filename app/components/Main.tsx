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
import EditTasksModal from "./EditTasksModal";

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
  width: "100%", // Matches parent (330px)
  maxWidth: "350px", // Ensures it does not grow beyond this width
  wordWrap: "break-word",
  overflowWrap: "break-word",
  whiteSpace: "normal", // Allows multi-line text
  display: "flex",
  // justifyContent: "center",
  // alignItems: "center",
  ...theme.applyStyles("dark", {
    backgroundColor: "#1A2027",
  }),
}));

interface Board {
  createdAt: string;
  title?: string;
  lists?: {
    title: string;
    _id: string;
    tasks?: Task[];
  }[];
  updatedAt: string;
  __v: number;
  _id?: string;
}

interface Task {
  title: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  subtasks?: string[];
  _id: string;
}

export interface List {
  _id: string;
  title: string;
  tasks?: { _id: string; title: string }[];
  boardId?: string;
}

interface MainProps {
  selectedBoard: Board | undefined;
}

const Main: FC<MainProps> = ({ selectedBoard }) => {
  const [columnName, setColumnName] = useState<string>("");
  const [newColumnStatus, setNewColumnStatus] = useState<string>(""); // For new column selection

  const [openEditBoardModal, setOpenEditBoardModal] = useState<boolean>(false);
  const [openEditTaskModal, setOpenEditTaskModal] = useState<boolean>(false);

  const [selectedBoardTitle, setSelectedBoardTitle] = useState<
    string | undefined
  >("");
  const [selectedBoardLists, setSelectedBoardLists] = useState<
    Array<List | undefined>
  >([]);
  const [taskId, setTaskId] = useState<string | undefined>("");

  const [boardId, setBoardId] = useState<string | undefined>("");

  const [createList] = useCreateListMutation();
  const [deleteList] = useDeleteListMutation();
  const [updateBoard] = useUpdateBoardMutation();

  const handleOpenEditBoardModal = () => setOpenEditBoardModal(true);
  const handleCloseEditBoardModal = () => setOpenEditBoardModal(false);
  const handleOpenEditTaskModal = (task_id: string) => {
    setTaskId(task_id);
    setOpenEditTaskModal(true);
  };
  const handleCloseEditTaskModal = () => setOpenEditTaskModal(false);
  console.log(taskId);
  useEffect(() => {
    if (selectedBoard) {
      setBoardId(selectedBoard._id);
      setSelectedBoardTitle(selectedBoard.title);
      setSelectedBoardLists(selectedBoard.lists || []);
    }
  }, [selectedBoard]);

  const handleEditBoardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    handleOpenEditBoardModal();
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
      handleCloseEditBoardModal();
    } catch (err) {
      console.error("Failed to submit changes:", err);
    }
  };

  const deleteColumn = async (columnId: string) => {
    try {
      await deleteList(columnId).unwrap();
      const newLists = selectedBoardLists.filter(
        (list) => list?._id !== columnId
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            {" "}
            <Stack spacing={2}>
              <Typography>
                This board is empty. Create a new column to get started
              </Typography>
              <Button sx={{ borderRadius: "20px" }} variant="contained">
                + Add a new column
              </Button>
            </Stack>
          </Box>
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
                    key={list?._id}
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
                        width: "330px",
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
                          key={task._id}
                          onClick={() => handleOpenEditTaskModal(task._id)}
                        >
                          {task.title}
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
                width: "350px",
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
          )}
        </Box>
      )}
      {openEditBoardModal && (
        <div onClick={(e) => e.stopPropagation()}>
          <EditBoardModal
            open={openEditBoardModal}
            handleClose={handleCloseEditBoardModal}
            addColumn={handleAddColumn}
            boardCollumns={selectedBoardLists.filter(
              (list): list is List => list !== undefined
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
      <div>
        <EditTasksModal
          open={openEditTaskModal}
          handleClose={handleCloseEditTaskModal}
          selectedBoard={selectedBoard}
          taskId={taskId}
        />
      </div>
    </Container>
  );
};

export default Main;
