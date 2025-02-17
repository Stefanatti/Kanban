import { FC, use, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import {
  Checkbox,
  CircularProgress,
  IconButton,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  useGetTaskByIdQuery,
  Task,
  useUpdateSubtaskMutation,
  useUpdateTaskMutation,
} from "@/lib/features/tasksSlice";
import MoreIcon from "@mui/icons-material/MoreVert";

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

interface List {
  _id: string;
  title: string;
  tasks?: { _id: string; title: string }[];
  boardId?: string;
  //   createdAt?: string;
  //   updatedAt?: string;
}

// interface Task {
//   title: string;
//   description?: string;
//   dueDate: Date;
//   completed: Boolean;
//   subtasks?: string[];
//   _id: string;
//}

interface ModalProps {
  open: boolean;
  handleClose: () => void;
  selectedBoard: Board | undefined;
  taskId?: string;
}
const statuses = ["To Do", "Doing", "Done"];

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  maxWidth: 700,
  minHeight: 400, // Allow modal to expand if needed
  maxHeight: "80vh", // Prevent overflowing
  bgcolor: "background.paper",
  borderRadius: "10px",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
};

function EditTasksModal({
  open,
  handleClose,
  selectedBoard,
  taskId,
}: ModalProps): React.ReactElement {
  const {
    data: fetchedTask,
    isLoading: fetchedTaskTaskisLoading,
    isError: fetchedTaskTaskIsError,
    // refetch, // Add this
  } = useGetTaskByIdQuery(taskId || "", {
    skip: !taskId,
  });

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTaskStatus, setSelectedTaskStatus] = useState<
    string | undefined
  >("");
  const [updateTask] = useUpdateTaskMutation();
  const [updateSubtask] = useUpdateSubtaskMutation();
  useEffect(() => {
    if (fetchedTaskTaskisLoading) {
      setSelectedTask(null);
    } else if (fetchedTask) {
      setSelectedTask(fetchedTask);
    }
  }, [fetchedTask, fetchedTaskTaskisLoading, taskId]);

  console.log(selectedTask);

  const handleSubtaskToggle = async (subtaskId: string) => {
    if (!selectedTask) return;

    const updatedSubtasks = selectedTask.subtasks?.map((subtask) =>
      subtask._id === subtaskId
        ? { ...subtask, completed: !subtask.completed }
        : subtask
    );

    // Update local state for instant UI feedback
    setSelectedTask((prev) =>
      prev ? { ...prev, subtasks: updatedSubtasks } : null
    );

    // 🔥 Call API to update the task in the backend
    try {
      await updateSubtask({
        taskId: selectedTask._id,
        subtaskId: subtaskId,
        changes: {
          completed: !selectedTask.subtasks?.find(
            (subtask) => subtask._id === subtaskId
          )?.completed,
        },
      });

      console.log("Subtask updated successfully!");
    } catch (error) {
      console.error("Error updating subtask:", error);
    }
  };

  const handleTaskStatusChange = async (newStatus: string) => {
    if (!selectedTask) return;

    const isCompleted = newStatus === "Done"; // ✅ Convert status to completed boolean

    // Update the task locally
    setSelectedTask((prev) =>
      prev
        ? { ...prev, completed: isCompleted, status: newStatus } // Update status and completed
        : prev
    );

    try {
      // First, find the list that matches the status
      const targetList = selectedBoard?.lists?.find(
        (list) => list.title === newStatus
      );

      // Ensure we found the corresponding list for the task status
      if (!targetList) {
        throw new Error(`No list found for status: ${newStatus}`);
      }

      // Now, update the task with the new listId and completed status
      await updateTask({
        id: selectedTask._id,
        changes: {
          completed: isCompleted, // Update completed field
          // status: newStatus, // Update status field
          listId: targetList._id, // Move task to correct list
        },
      });

      console.log(
        `Task updated: Moved to ${newStatus} and completed = ${isCompleted}`
      );
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        {fetchedTaskTaskisLoading || !selectedTask ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                pb: 2,
              }}
            >
              <Typography
                id="modal-modal-title"
                variant="h5"
                component="h2"
                sx={{
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "normal",
                  flexGrow: 1, // Make it flexible
                }}
              >
                {selectedTask?.title}
              </Typography>
              <IconButton>
                <MoreIcon />
              </IconButton>
            </Box>

            {/* Description */}
            <Box
              sx={{
                backgroundColor: "#f5f5f5",
                p: 2,
                borderRadius: "8px",
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "normal",
                }}
              >
                {selectedTask?.description}
              </Typography>
            </Box>

            {/* Subtasks */}
            <Box>
              <Typography variant="h6">Subtasks</Typography>
              {selectedTask?.subtasks?.map((subtask, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mt: 1,
                    p: 1,
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                  }}
                >
                  {/* Checkbox */}
                  <Checkbox
                    checked={subtask.completed}
                    onChange={() =>
                      subtask._id && handleSubtaskToggle(subtask._id)
                    }
                  />

                  {/* Subtask Title */}
                  <Typography
                    sx={{
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                      whiteSpace: "normal",
                      flexGrow: 1, // Make the text flexible
                    }}
                  >
                    {subtask.title}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Status Dropdown */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6">Current Status</Typography>
              <TextField
                id="outlined-select-currency"
                select
                label="Select"
                fullWidth
                value={selectedTask?.completed ? "Done" : false} // ✅ Reflect the current status in the dropdown
                onChange={(e) => handleTaskStatusChange(e.target.value)} // ✅ Pass new status
              >
                {statuses.map((status, index) => (
                  <MenuItem key={index} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
}

export default EditTasksModal;
