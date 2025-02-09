import { FC, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { MenuItem, TextField } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

interface List {
  _id: string;
  title: string;
  tasks?: { _id: string; title: string }[];
}

interface EditBoardModalProps {
  open: boolean;
  handleClose: () => void;
  addColumn: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  boardName?: string;
  // setBoardName: React.Dispatch<React.SetStateAction<string>>;
  setBoardName: (title: string) => void;
  boardCollumns?: List[];
  columnName?: string;
  setColumnName: (title: string) => void;
  deleteColumn: (id: string) => void;
  setNewColumnStatus?: (status: string) => void;
  newColumnStatus?: string;
}

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  maxWidth: 400,
  minHeight: 350,
  overflow: "auto",
  bgcolor: "background.paper",
  border: "2px solid #000",
  borderRadius: "10px",
  boxShadow: 24,
  p: 4,
};

function EditBoardModal({
  open,
  handleClose,
  boardName,
  setBoardName,
  columnName,
  setColumnName,
  boardCollumns,
  addColumn,
  deleteColumn,
  setNewColumnStatus,
  newColumnStatus,
}: EditBoardModalProps): React.ReactElement {
  const [addNewColumn, setAddNewColumn] = useState(false);

  const statuses = ["To Do", "Doing", "Done"];
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addColumn(event);
  };
  const handleBoardNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setBoardName(event.target.value);
  };

  const handleColumnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColumnName(event.target.value);
  };
  return (
    <Modal
      sx={{ overflow: "auto" }}
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h5" component="h2">
          Edit Board
        </Typography>
        <Box
          component="form"
          onSubmit={handleFormSubmit}
          sx={{ "& .MuiTextField-root": { m: 2, width: "50ch" } }}
          //sx={{ display: "flex", flexDirection: "column" }}
          noValidate
          autoComplete="off"
        >
          <Box>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Board Name
            </Typography>

            <TextField
              sx={{ width: 400, maxWidth: "100%" }}
              // label={boardName}
              id="outlined-size-small"
              size="small"
              type="text"
              value={boardName}
              onChange={handleBoardNameChange}
            />
          </Box>
          <Box>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Board columns
            </Typography>

            {boardCollumns &&
              boardCollumns.map((column) => (
                <Box
                  key={column._id}
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                >
                  {/* Dropdown for existing columns */}

                  {/* <TextField
                    sx={{ width: 350, maxWidth: "100%" }}
                    label={column.title}
                    id="outlined-size-small"
                    value={column.title}
                    size="small"
                  /> */}
                  <TextField
                    id="outlined-select-currency"
                    select
                    // label="Select"
                    label={column.title}
                    //defaultValue="To Do"
                    value={column.title}
                    helperText="Please select your column status"
                  >
                    {statuses.map((status, index) => (
                      <MenuItem key={index} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </TextField>
                  <ClearIcon onClick={() => deleteColumn(column._id)} />
                </Box>
              ))}

            {addNewColumn && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              >
                {/* <TextField
                  sx={{ width: 350, maxWidth: "100%" }}
                  label="Size"
                  id="outlined-size-small"
                  size="small"
                  value={columnName}
                  onChange={handleColumnChange}
                /> */}

                <TextField
                  id="outlined-select-currency"
                  select
                  // label="Select"
                  //  label={column.title}
                  //defaultValue="To Do"
                  value={newColumnStatus}
                  onChange={(e) =>
                    setNewColumnStatus && setNewColumnStatus(e.target.value)
                  }
                  helperText="Please select your column status"
                >
                  {statuses.map((status, index) => (
                    <MenuItem key={index} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </TextField>
                <ClearIcon />
              </Box>
            )}
          </Box>
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: "10px", m: 3 }}
          >
            <Button
              sx={{ borderRadius: "20px" }}
              variant="contained"
              onClick={() => setAddNewColumn(true)}
              type="button"
            >
              + Add a New Column
            </Button>
            <Button
              sx={{ borderRadius: "20px" }}
              variant="contained"
              type="submit"
            >
              Save Changes
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

export default EditBoardModal;
