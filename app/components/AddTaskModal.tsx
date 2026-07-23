import { FC, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { MenuItem, TextField } from "@mui/material";
import { Board } from "@/app/interfaces/interfaces";

interface ModalProps {
  open: boolean;
  handleClose: () => void;
  selectedBoard: Board | undefined;
  newTaskName: string;
  setNewTaskName: (status: string) => void;
  listId?: string;
  setListId?: (id: string) => void;
  addTask: (taskName: string, listId?: string) => Promise<void>;
}
const statuses = ["To Do", "Doing", "Done"];

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  maxWidth: 400,
  height: 750,
  bgcolor: "background.paper",
  border: "2px solid #000",
  borderRadius: "10px",
  boxShadow: 24,
  p: 4,
};

// const AddBoardModal: FC<ButtonModalProps>: React.ReactElement = ({
//   open,
//   handleClose,
//   addBoards,
// }) => {
function AddTaskModal({
  open,
  handleClose,
  selectedBoard,
  addTask,
  newTaskName,
  setNewTaskName,
  listId,
  setListId,
}: ModalProps): React.ReactElement {
  // const [newTaskName, setNewTaskName] = useState("");
  const [selectedColumnStatus, setSelectedColumnStatus] = useState<string>("");

  const handleCreateNewTask = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!newTaskName.trim() || !selectedColumnStatus.trim()) {
      alert("Task name and status are required!");
      return;
    }

    // Find the list ID based on status
    const targetList = selectedBoard?.lists?.find(
      (list) => list.title === selectedColumnStatus,
    );
    if (!targetList) {
      alert("Invalid board configuration!");
      return;
    }

    try {
      // Create the task
      await addTask(newTaskName, targetList.id);

      // Reset form
      if (setNewTaskName) setNewTaskName("");
      setSelectedColumnStatus("");

      // Close modal after success
      handleClose();
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task. Please try again.");
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
          Add a new task
        </Typography>
        <Box
          component="form"
          onSubmit={handleCreateNewTask}
          sx={{
            "& .MuiTextField-root": { m: 2, width: "50ch" },
            // display: "flex",
            // flexDirection: "column",
          }}
          noValidate
          autoComplete="off"
        >
          <Box>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Title
            </Typography>

            <TextField
              sx={{ width: 400, maxWidth: "100%" }}
              label="new task"
              id="outlined-size-small"
              size="small"
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName && setNewTaskName(e.target.value)}
            />
          </Box>
          <Box>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Description
            </Typography>

            <TextField
              sx={{ width: 350, maxWidth: "100%" }}
              label="Size"
              id="outlined-size-small"
              defaultValue="Small"
              size="small"
            />
            {/*   <TextField
              sx={{ width: 350, maxWidth: "100%" }}
              label="Size"
              id="outlined-size-small"
              defaultValue="Small"
              size="small"
            /> */}
          </Box>
          <Box>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Subtasks
            </Typography>

            <TextField
              sx={{ width: 350, maxWidth: "100%" }}
              label="Subtask"
              id="outlined-size-small"
              defaultValue="Small"
              size="small"
            />

            <TextField
              sx={{ width: 350, maxWidth: "100%" }}
              label="Description"
              id="outlined-size-small"
              defaultValue="Small"
              size="small"
            />
          </Box>
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: "10px", m: 3 }}
          >
            <Button sx={{ borderRadius: "20px" }} variant="contained">
              + Add a New Subtask
            </Button>
          </Box>
          <Box>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Status
            </Typography>

            <TextField
              id="outlined-select-currency"
              select
              label="Select"
              // label={column.title}
              //defaultValue="To Do"
              value={selectedColumnStatus}
              helperText="Please select your column status"
              onChange={(e) =>
                setSelectedColumnStatus &&
                setSelectedColumnStatus(e.target.value)
              }
            >
              {statuses.map((status, index) => (
                <MenuItem key={index} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: "10px", m: 3 }}
          >
            <Button
              sx={{ borderRadius: "20px" }}
              variant="contained"
              type="submit"
            >
              + Create New Task
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

export default AddTaskModal;
