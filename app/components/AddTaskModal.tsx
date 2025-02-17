import { FC, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { IconButton, MenuItem, TextField } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

interface Board {
  createdAt: string;
  title?: string;
  lists?:
    | {
        title: string;
        _id: string;
        tasks?: Task[];
      }[]
    | undefined;
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

interface Task {
  title: string;
  description: string;
  dueDate: Date;
  completed: Boolean;
  subtasks?: string[];
  _id: string;
}

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
    listId: string,
    isCompleted: boolean,
    description?: string,
    subtasks?: string[]
  ) => Promise<void>;
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

function AddTaskModal({
  open,
  handleClose,
  selectedBoard,
  addTask,
  newTaskName,
  setNewTaskName,
}: ModalProps): React.ReactElement {
  // const [newTaskName, setNewTaskName] = useState("");
  const [selectedColumnStatus, setSelectedColumnStatus] = useState<string>("");
  const [taskDescription, setTaskDescription] = useState<string>("");
  const [subtasks, setSubtasks] = useState<string[]>([]);

  // const [subtasks, setSubtasks] = useState<string[]>(
  //   selectedBoard?.lists
  //     ?.flatMap((list) => list.tasks || [])
  //     .flatMap((task) => task.subtasks || []) || []
  // );
  const [addNewSubtask, setAddNewSubtask] = useState(false);

  console.log(subtasks);

  // Handle adding a new empty subtask field
  const handleAddSubtask = () => {
    setSubtasks([...subtasks, ""]);
  };

  // Handle updating the value of a specific subtask
  const handleSubtaskChange = (index: number, value: string) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index] = value;
    setSubtasks(updatedSubtasks);
  };

  // Handle removing a subtask field
  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleCreateNewTask = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (!newTaskName.trim() || !selectedColumnStatus.trim()) {
      alert("Task name and status are required!");
      return;
    }
    const targetList = selectedBoard?.lists?.find(
      (list) => list.title === selectedColumnStatus
    );
    if (!targetList) {
      alert("Invalid board configuration!");
      return;
    }
    try {
      const isCompleted = selectedColumnStatus === "Done";

      await addTask(
        newTaskName,
        targetList._id,
        isCompleted,
        taskDescription,
        subtasks
      );

      if (setNewTaskName) setNewTaskName("");
      setSelectedColumnStatus("");
      setNewTaskName("");
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
              //label="Size"
              placeholder="Describe your task..."
              id="outlined-size-small"
              size="small"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
            />
          </Box>
          <Box>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Subtasks
            </Typography>
            {subtasks.map((subtask, index) => (
              <Box
                key={index}
                sx={{ display: "flex", alignItems: "center", mt: 1 }}
              >
                <TextField
                  fullWidth
                  placeholder={`Subtask ${index + 1}`}
                  size="small"
                  value={subtask}
                  onChange={(e) => handleSubtaskChange(index, e.target.value)}
                />
                <IconButton
                  onClick={() => handleRemoveSubtask(index)}
                  sx={{ ml: 1 }}
                >
                  <ClearIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
          <Button
            fullWidth
            sx={{ borderRadius: "20px", mt: 2 }}
            variant="contained"
            onClick={handleAddSubtask}
          >
            + Add a New Subtask
          </Button>

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
