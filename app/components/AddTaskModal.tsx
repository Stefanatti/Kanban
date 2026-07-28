import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { MenuItem, TextField } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { Board, Task, Subtask } from "@/app/interfaces/interfaces";

interface ModalProps {
  open: boolean;
  handleClose: () => void;
  selectedBoard: Board | undefined;
  newTaskName: string;
  setNewTaskName: (status: string) => void;
  listId?: string;
  setListId?: (id: string) => void;
  addTask: (
    taskName: string,
    listId?: string,
    description?: string,
    subtasks?: { title: string }[],
  ) => Promise<void>;
  // Edit mode props
  editTask?: Task;
  onUpdateTask?: (taskId: string, changes: Partial<Task>) => Promise<void>;
}
const statuses = ["To Do", "Doing", "Done"];

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 550,
  bgcolor: "background.paper",
  border: "2px solid #000",
  borderRadius: "10px",
  boxShadow: 24,
  p: 4,
};

function AddTaskModal({
  open,
  handleClose,
  selectedBoard,
  addTask,
  newTaskName,
  setNewTaskName,
  editTask,
  onUpdateTask,
}: ModalProps): React.ReactElement {
  const isEditMode = !!editTask;

  const [selectedColumnStatus, setSelectedColumnStatus] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState<string>("");
  const [addingSubtask, setAddingSubtask] = useState<boolean>(false);
  const [taskTitle, setTaskTitle] = useState<string>("");

  // Pre-fill fields when editing
  useEffect(() => {
    if (editTask) {
      setTaskTitle(editTask.title);
      setDescription(editTask.description || "");
      setSubtasks(editTask.subtasks || []);
      // Find which list this task belongs to
      const taskList = selectedBoard?.lists?.find((list) =>
        list.tasks?.some((t) => t.id === editTask.id),
      );
      setSelectedColumnStatus(taskList?.title || "");
    } else {
      setTaskTitle("");
      setDescription("");
      setSubtasks([]);
      setSelectedColumnStatus("");
    }
  }, [editTask, selectedBoard]);

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([
        ...subtasks,
        {
          id: crypto.randomUUID(),
          title: newSubtask.trim(),
          isCompleted: false,
        },
      ]);
      setNewSubtask("");
      setAddingSubtask(false);
    }
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = isEditMode ? taskTitle : newTaskName;

    if (!title.trim() || !selectedColumnStatus.trim()) {
      alert("Task name and status are required!");
      return;
    }

    const targetList = selectedBoard?.lists?.find(
      (list) => list.title === selectedColumnStatus,
    );
    if (!targetList) {
      alert("Invalid board configuration!");
      return;
    }

    try {
      if (isEditMode && onUpdateTask && editTask) {
        await onUpdateTask(editTask.id, {
          title: taskTitle,
          description,
          subtasks,
          listId: targetList.id,
        });
      } else {
        await addTask(
          newTaskName,
          targetList.id,
          description,
          subtasks.map((s) => ({ title: s.title })),
        );
        if (setNewTaskName) setNewTaskName("");
      }

      setSelectedColumnStatus("");
      setDescription("");
      setSubtasks([]);
      handleClose();
    } catch (error) {
      console.error("Failed to save task:", error);
      alert("Failed to save task. Please try again.");
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
        <Typography id="modal-modal-title" variant="h5" component="h2">
          {isEditMode ? "Edit Task" : "Add a new task"}
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            "& .MuiTextField-root": { my: 0.5, width: "100%" },
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
          noValidate
          autoComplete="off"
        >
          <Box>
            <Typography variant="h6" component="h2">
              Title
            </Typography>
            <TextField
              label="Task name"
              size="small"
              type="text"
              value={isEditMode ? taskTitle : newTaskName}
              onChange={(e) =>
                isEditMode
                  ? setTaskTitle(e.target.value)
                  : setNewTaskName && setNewTaskName(e.target.value)
              }
            />
          </Box>

          <Box>
            <Typography variant="h6" component="h2">
              Description
            </Typography>
            <TextField
              label="Description"
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. It's always good to take a break..."
            />
          </Box>

          <Box>
            <Typography variant="h6" component="h2">
              Subtasks
            </Typography>

            {subtasks.map((subtask, index) => (
              <Box
                key={subtask.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <TextField
                  size="small"
                  value={subtask.title}
                  onChange={(e) => {
                    const updated = [...subtasks];
                    updated[index] = {
                      ...updated[index],
                      title: e.target.value,
                    };
                    setSubtasks(updated);
                  }}
                />
                <ClearIcon
                  sx={{ cursor: "pointer" }}
                  onClick={() => handleRemoveSubtask(index)}
                />
              </Box>
            ))}

            {addingSubtask && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <TextField
                  label="New subtask"
                  size="small"
                  value={newSubtask}
                  autoFocus
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                />
                <ClearIcon
                  sx={{ cursor: "pointer" }}
                  onClick={() => {
                    setAddingSubtask(false);
                    setNewSubtask("");
                  }}
                />
              </Box>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              mt: 1,
            }}
          >
            <Button
              sx={{ borderRadius: "20px" }}
              variant="contained"
              onClick={() => {
                if (addingSubtask) {
                  handleAddSubtask();
                } else {
                  setAddingSubtask(true);
                }
              }}
            >
              + Add a New Subtask
            </Button>
          </Box>

          <Box>
            <Typography variant="h6" component="h2">
              Status
            </Typography>
            <TextField
              id="outlined-select-status"
              select
              label="Select"
              value={selectedColumnStatus}
              helperText="Please select your column status"
              onChange={(e) => setSelectedColumnStatus(e.target.value)}
            >
              {statuses.map((status, index) => (
                <MenuItem key={index} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              mt: 1,
            }}
          >
            <Button
              sx={{ borderRadius: "20px" }}
              variant="contained"
              type="submit"
            >
              {isEditMode ? "Save Changes" : "+ Create New Task"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

export default AddTaskModal;
