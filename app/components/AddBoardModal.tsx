import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { MenuItem, TextField } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

interface AddBoardModalProps {
  open: boolean;
  handleClose: () => void;
  createBoard: (
    event: React.FormEvent<HTMLFormElement>,
    columns: string[],
  ) => Promise<void>;
  boardName: string;
  setBoardName: (title: string) => void;
}

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  maxWidth: 400,
  minHeight: 350,
  bgcolor: "background.paper",
  border: "2px solid #000",
  borderRadius: "10px",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: 3,
};

const availableStatuses = ["To Do", "Doing", "Done"];

function AddBoardModal({
  open,
  handleClose,
  createBoard,
  boardName,
  setBoardName,
}: AddBoardModalProps): React.ReactElement {
  const [columns, setColumns] = useState<string[]>(["To Do", "Doing"]);
  const [addingNew, setAddingNew] = useState(false);
  const [newColumnStatus, setNewColumnStatus] = useState("");

  const handleRemoveColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleAddColumn = () => {
    if (newColumnStatus && !columns.includes(newColumnStatus)) {
      setColumns([...columns, newColumnStatus]);
      setNewColumnStatus("");
      setAddingNew(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createBoard(event, columns);
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
          Create a new board
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ "& .MuiTextField-root": { m: 2, width: "50ch" } }}
          noValidate
          autoComplete="off"
        >
          <Box>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Board Name
            </Typography>

            <TextField
              sx={{ width: 400, maxWidth: "100%" }}
              label="Board"
              id="outlined-size-small"
              size="small"
              type="text"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
            />
          </Box>
          <Box>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Board columns
            </Typography>

            {columns.map((col, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              >
                <TextField
                  sx={{ width: 350, maxWidth: "100%" }}
                  size="small"
                  value={col}
                  disabled
                />
                <ClearIcon
                  sx={{ cursor: "pointer" }}
                  onClick={() => handleRemoveColumn(index)}
                />
              </Box>
            ))}

            {addingNew && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              >
                <TextField
                  id="new-column-select"
                  select
                  label="Select column"
                  size="small"
                  value={newColumnStatus}
                  onChange={(e) => setNewColumnStatus(e.target.value)}
                  helperText="Select a column status"
                >
                  {availableStatuses
                    .filter((s) => !columns.includes(s))
                    .map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                </TextField>
                <Button size="small" onClick={handleAddColumn}>
                  Add
                </Button>
                <ClearIcon
                  sx={{ cursor: "pointer" }}
                  onClick={() => setAddingNew(false)}
                />
              </Box>
            )}
          </Box>
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: "10px", m: 3 }}
          >
            <Button
              sx={{ borderRadius: "20px" }}
              variant="contained"
              onClick={() => setAddingNew(true)}
              disabled={columns.length >= availableStatuses.length}
            >
              + Add a New Column
            </Button>
            <Button
              sx={{ borderRadius: "20px" }}
              variant="contained"
              type="submit"
            >
              + Create New Board
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

export default AddBoardModal;
