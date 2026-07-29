import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import {
  Checkbox,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  TextField,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Task, Subtask, List } from "@/app/interfaces/interfaces";

interface ViewTaskModalProps {
  open: boolean;
  handleClose: () => void;
  task: Task;
  columns: List[];
  onToggleSubtask: (subtaskId: string, isCompleted: boolean) => Promise<void>;
  onChangeStatus: (taskId: string, newListId: string) => Promise<void>;
  onEditTask: () => void;
  onDeleteTask: () => void;
}

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 480,
  maxHeight: "90vh",
  overflow: "auto",
  bgcolor: "background.paper",
  border: "2px solid #000",
  borderRadius: "10px",
  boxShadow: 24,
  p: 4,
} as const;

function ViewTaskModal({
  open,
  handleClose,
  task,
  columns,
  onToggleSubtask,
  onChangeStatus,
  onEditTask,
  onDeleteTask,
}: ViewTaskModalProps): React.ReactElement {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks || []);
  const [currentListId, setCurrentListId] = useState<string>(task.listId || "");

  const completedCount = subtasks.filter((s) => s.isCompleted).length;
  const totalCount = subtasks.length;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleToggleSubtask = async (subtaskId: string, checked: boolean) => {
    // Optimistically update local state
    setSubtasks((prev) =>
      prev.map((s) =>
        s.id === subtaskId ? { ...s, isCompleted: checked } : s,
      ),
    );
    try {
      await onToggleSubtask(subtaskId, checked);
    } catch {
      // Revert on error
      setSubtasks((prev) =>
        prev.map((s) =>
          s.id === subtaskId ? { ...s, isCompleted: !checked } : s,
        ),
      );
    }
  };

  const handleStatusChange = async (newListId: string) => {
    const oldListId = currentListId;
    setCurrentListId(newListId);
    try {
      await onChangeStatus(task.id, newListId);
    } catch {
      setCurrentListId(oldListId);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="view-task-modal-title"
    >
      <Box sx={style}>
        {/* Title row with three dots menu */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Typography
            id="view-task-modal-title"
            variant="h6"
            component="h2"
            sx={{ fontWeight: 700, flex: 1 }}
          >
            {task.title}
          </Typography>

          <IconButton size="small" onClick={handleMenuOpen} sx={{ ml: 1 }}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose();
                onEditTask();
              }}
            >
              Edit Task
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMenuClose();
                onDeleteTask();
              }}
              sx={{ color: "error.main" }}
            >
              Delete Task
            </MenuItem>
          </Menu>
        </Box>

        {/* Description */}
        {task.description && (
          <Typography
            component="p"
            sx={{ color: "grey.600", mb: 3, fontSize: "0.9rem" }}
          >
            {task.description}
          </Typography>
        )}

        {/* Subtasks */}
        {totalCount > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
              Subtasks ({completedCount} of {totalCount})
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {subtasks.map((subtask) => (
                <Box
                  key={subtask.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#f5f5f5",
                    borderRadius: 1,
                    px: 1.5,
                    py: 0.5,
                    "&:hover": { backgroundColor: "#e8e8e8" },
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={subtask.isCompleted}
                        onChange={(e) =>
                          handleToggleSubtask(subtask.id, e.target.checked)
                        }
                        size="small"
                      />
                    }
                    label={
                      <Typography
                        sx={{
                          textDecoration: subtask.isCompleted
                            ? "line-through"
                            : "none",
                          color: subtask.isCompleted
                            ? "grey.500"
                            : "text.primary",
                          fontSize: "0.85rem",
                        }}
                      >
                        {subtask.title}
                      </Typography>
                    }
                    sx={{ m: 0, flex: 1 }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Current Status */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Current Status
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={currentListId}
            onChange={(e) => handleStatusChange(e.target.value)}
            SelectProps={{ native: true }}
          >
            {columns.map((col) => (
              <option key={col.id} value={col.id}>
                {col.title}
              </option>
            ))}
          </TextField>
        </Box>
      </Box>
    </Modal>
  );
}

export default ViewTaskModal;
