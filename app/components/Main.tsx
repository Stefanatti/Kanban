"use client";
import * as React from "react";
import { useState, useEffect, FC } from "react";
import { Box, Button, Typography, Stack, Paper, styled, IconButton, Tooltip } from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import TaskReminderModal from "./TaskReminderModal";
import { useUpdateBoardMutation } from "@/lib/features/boardSlice";
import EditBoardModal from "./EditBoardModal";
import {
  useCreateListMutation,
  useDeleteListMutation,
  useUpdateListMutation,
} from "@/lib/features/listsSlice";
import {
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "@/lib/features/tasksSlice";
import AddTaskModal from "./AddTaskModal";
import ViewTaskModal from "./ViewTaskModal";
import DeleteTaskModal from "./DeleteTaskModal";
import {
  Board,
  Task,
  List,
  TaskUpdateInput,
} from "@/app/interfaces/interfaces";

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
  onRegisterEditBoard?: (fn: () => void) => void;
}

const Main: FC<MainProps> = ({ selectedBoard, onRegisterEditBoard }) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedBoardTitle, setSelectedBoardTitle] = useState<
    string | undefined
  >("");
  const [selectedBoardLists, setSelectedBoardLists] = useState<
    Array<List | undefined>
  >([]);

  const [boardId, setBoardId] = useState<string | undefined>("");

  const [createList] = useCreateListMutation();
  const [deleteList] = useDeleteListMutation();
  const [updateList] = useUpdateListMutation();
  const [updateBoard] = useUpdateBoardMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTaskMutation] = useDeleteTaskMutation();

  // Task modal states
  const [viewTaskModalOpen, setViewTaskModalOpen] = useState(false);
  const [editTaskModalOpen, setEditTaskModalOpen] = useState<boolean>(false);
  const [deleteTaskModalOpen, setDeleteTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  // Register the edit board opener so KanbanBar can trigger it
  useEffect(() => {
    if (onRegisterEditBoard) {
      onRegisterEditBoard(handleOpenModal);
    }
  }, [onRegisterEditBoard]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setViewTaskModalOpen(true);
  };

  const handleCloseViewTaskModal = () => {
    setViewTaskModalOpen(false);
    setSelectedTask(undefined);
  };

  const handleCloseTaskModal = () => {
    setEditTaskModalOpen(false);
    setSelectedTask(undefined);
  };

  const handleOpenEditFromView = () => {
    // Close view modal but keep selectedTask, then open edit
    setViewTaskModalOpen(false);
    setEditTaskModalOpen(true);
  };

  const handleOpenDeleteFromView = () => {
    // Close view modal but keep selectedTask, then open delete confirmation
    setViewTaskModalOpen(false);
    setDeleteTaskModalOpen(true);
  };

  const handleToggleSubtask = async (
    subtaskId: string,
    isCompleted: boolean,
  ) => {
    try {
      await fetch(`/api/subtasks/${subtaskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted }),
      });
      // Update local state
      setSelectedBoardLists((prevLists) =>
        prevLists.map((list) => {
          if (!list) return list;
          return {
            ...list,
            tasks: list.tasks?.map((task) => {
              if (task.id !== selectedTask?.id) return task;
              return {
                ...task,
                subtasks: task.subtasks?.map((s) =>
                  s.id === subtaskId ? { ...s, isCompleted } : s,
                ),
              };
            }),
          };
        }),
      );
    } catch (err) {
      console.error("Failed to toggle subtask:", err);
      throw err;
    }
  };

  const handleChangeStatus = async (taskId: string, newListId: string) => {
    try {
      const updatedTask = await updateTask({ id: taskId, changes: { listId: newListId } }).unwrap();
      // Move task between columns in local state
      setSelectedBoardLists((prevLists) => {
        let movedTask: Task | undefined;
        // Remove from old column
        const withoutTask = prevLists.map((list) => {
          if (!list) return list;
          const found = list.tasks?.find((t) => t.id === taskId);
          if (found) movedTask = updatedTask;
          return {
            ...list,
            tasks: list.tasks?.filter((t) => t.id !== taskId),
          };
        });
        // Add to new column
        if (!movedTask) return prevLists;
        return withoutTask.map((list) => {
          if (!list) return list;
          if (list.id === newListId) {
            return { ...list, tasks: [...(list.tasks || []), movedTask!] };
          }
          return list;
        });
      });
    } catch (err) {
      console.error("Failed to change task status:", err);
      throw err;
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    try {
      await deleteTaskMutation(selectedTask.id).unwrap();
      // Remove from local state
      setSelectedBoardLists((prevLists) =>
        prevLists.map((list) => {
          if (!list) return list;
          return {
            ...list,
            tasks: list.tasks?.filter((t) => t.id !== selectedTask.id),
          };
        }),
      );
      setDeleteTaskModalOpen(false);
      setSelectedTask(undefined);
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const handleUpdateTask = async (taskId: string, changes: TaskUpdateInput) => {
    try {
      const updatedTask = await updateTask({ id: taskId, changes }).unwrap();
      // Update local state to reflect changes
      setSelectedBoardLists((prevLists) =>
        prevLists.map((list) => {
          if (!list) return list;
          return {
            ...list,
            tasks: list.tasks?.map((task) =>
              task.id === taskId ? updatedTask : task,
            ),
          };
        }),
      );
      setSelectedTask(updatedTask);
    } catch (err) {
      console.error("Failed to update task:", err);
      throw err;
    }
  };
  useEffect(() => {
    if (selectedBoard) {
      setBoardId(selectedBoard.id);
      setSelectedBoardTitle(selectedBoard.title);
      setSelectedBoardLists(selectedBoard.lists || []);
    } else {
      setBoardId("");
      setSelectedBoardTitle("");
      setSelectedBoardLists([]);
    }
  }, [selectedBoard]);

  const handleEditBoardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    handleOpenModal();
  };

  const handleSaveBoard = async (data: {
    boardName: string;
    columnsToKeep: { id: string; title: string }[];
    columnsToAdd: string[];
    columnsToDelete: string[];
  }) => {
    if (!boardId) return;

    try {
      // 1. Update board name if changed
      if (data.boardName !== selectedBoardTitle) {
        await updateBoard({
          id: boardId,
          changes: { title: data.boardName },
        }).unwrap();
        setSelectedBoardTitle(data.boardName);
      }

      // 2. Delete removed columns
      for (const colId of data.columnsToDelete) {
        await deleteList(colId).unwrap();
      }

      // 3. Rename existing columns if title changed
      for (const col of data.columnsToKeep) {
        const original = selectedBoardLists.find((l) => l?.id === col.id);
        if (original && original.title !== col.title) {
          await updateList({
            id: col.id,
            changes: { title: col.title },
          }).unwrap();
        }
      }

      // 4. Create new columns
      const newLists = [];
      for (const title of data.columnsToAdd) {
        const newList = await createList({ title, boardId }).unwrap();
        newLists.push(newList);
      }

      // 5. Update local state to reflect all changes
      const updatedLists = selectedBoardLists
        .filter((list) => list && !data.columnsToDelete.includes(list.id))
        .map((list) => {
          if (!list) return list;
          const kept = data.columnsToKeep.find((c) => c.id === list.id);
          if (kept) return { ...list, title: kept.title };
          return list;
        });

      setSelectedBoardLists([...updatedLists, ...newLists]);
    } catch (err) {
      console.error("Failed to save board changes:", err);
      throw err;
    }
  };

  return (
    <Box sx={{ px: 2, width: "100%" }}>
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
                      maxWidth: "400px",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          backgroundColor:
                            list?.title?.toLowerCase() === "to do"
                              ? "#87CEEB"
                              : list?.title?.toLowerCase() === "doing"
                                ? "#9B59B6"
                                : list?.title?.toLowerCase() === "done"
                                  ? "#90EE90"
                                  : "#87CEEB",
                        }}
                      />
                      <Typography
                        sx={{
                          fontWeight: 600,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                          fontSize: "0.8rem",
                        }}
                      >
                        {list?.title}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        minWidth: "330px",
                        height: "95%",
                        //backgroundColor: "#d33cc6",
                        boxShadow: 1,
                        borderRadius: 2,
                        padding: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {list?.tasks?.map((task) => {
                        const hasReminder = !task.completed && list.title.trim().toLowerCase() !== "done" &&
                          Boolean(task.reminders?.some((reminder) => !reminder.sentAt && !reminder.cancelledAt));
                        return (
                        <TaskItem
                          key={task.id}
                          sx={{
                            cursor: "pointer",
                            minHeight: "80px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            backgroundColor: "background.paper",
                            "&:hover": { backgroundColor: "action.hover" },
                          }}
                          onClick={() => handleTaskClick(task)}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>
                            {task.title}
                          </Typography>
                          <Tooltip title={hasReminder ? "Edit reminder" : "Set reminder"}>
                            <IconButton aria-label={`${hasReminder ? "Edit" : "Set"} reminder for ${task.title}`}
                              sx={{ color: hasReminder ? "primary.main" : "text.disabled", width: 44, height: 44, flexShrink: 0 }}
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedTask(task);
                                setReminderModalOpen(true);
                              }}>
                              {hasReminder ? <NotificationsActiveIcon /> : <NotificationsNoneIcon />}
                            </IconButton>
                          </Tooltip>
                          </Box>
                          {task.subtasks && task.subtasks.length > 0 && (
                            <Typography
                              variant="body2"
                              sx={{ color: "text.secondary", mt: 0.5 }}
                            >
                              {
                                task.subtasks.filter((s) => s.isCompleted)
                                  .length
                              }{" "}
                              of {task.subtasks.length} subtasks
                            </Typography>
                          )}
                        </TaskItem>
                      ); })}
                    </Box>
                  </Box>
                ))}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    minWidth: "330px",
                  }}
                >
                  <Box sx={{ height: "24px" }} />
                  <Box
                    sx={{
                      maxWidth: "330px",
                      height: "95%",
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark" ? "#3E3F4E" : "#E4EBFA",
                      boxShadow: 1,
                      borderRadius: 2,
                      p: 2,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    onClick={handleEditBoardClick}
                  >
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: "grey.500",
                        fontSize: "1.2rem",
                      }}
                    >
                      + New Column
                    </Typography>
                  </Box>
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
            boardName={selectedBoardTitle || ""}
            boardColumns={selectedBoardLists.filter(
              (list): list is List => list !== undefined,
            )}
            onSave={handleSaveBoard}
          />
        </div>
      )}
      {viewTaskModalOpen && selectedTask && (
        <div onClick={(e) => e.stopPropagation()}>
          <ViewTaskModal
            open={true}
            handleClose={handleCloseViewTaskModal}
            task={selectedTask}
            columns={selectedBoardLists.filter(
              (list): list is List => list !== undefined,
            )}
            onToggleSubtask={handleToggleSubtask}
            onChangeStatus={handleChangeStatus}
            onEditTask={handleOpenEditFromView}
            onDeleteTask={handleOpenDeleteFromView}
          />
        </div>
      )}
      {reminderModalOpen && selectedTask && (
        <TaskReminderModal task={selectedTask}
          completed={Boolean(selectedTask.completed || selectedBoardLists.some((list) =>
            list?.title.trim().toLowerCase() === "done" && list.tasks?.some((task) => task.id === selectedTask.id)))}
          onSave={handleUpdateTask}
          onClose={() => { setReminderModalOpen(false); setSelectedTask(undefined); }} />
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
      {deleteTaskModalOpen && selectedTask && (
        <div onClick={(e) => e.stopPropagation()}>
          <DeleteTaskModal
            open={true}
            handleClose={() => {
              setDeleteTaskModalOpen(false);
              setSelectedTask(undefined);
            }}
            taskName={selectedTask.title}
            onDelete={handleDeleteTask}
          />
        </div>
      )}
    </Box>
  );
};

export default Main;
