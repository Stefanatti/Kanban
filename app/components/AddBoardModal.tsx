import { FC, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { TextField } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

interface AddBoardModalProps {
  open: boolean;
  handleClose: () => void;
  createBoard: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  boardName: string;
  setBoardName: (title: string) => () => void;
}

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  maxWidth: 400,
  height: 350,
  bgcolor: "background.paper",
  border: "2px solid #000",
  borderRadius: "10px",
  boxShadow: 24,
  p: 4,
};

function AddBoardModal({
  open,
  handleClose,
  createBoard,
  boardName,
  setBoardName,
}: AddBoardModalProps): React.ReactElement {
  const [addNewColumn, setAddNewColumn] = useState(false);

  const [newColumn, setNewColumn] = useState("");

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
          onSubmit={createBoard}
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

            {addNewColumn && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              >
                <TextField
                  sx={{ width: 350, maxWidth: "100%" }}
                  label="Size"
                  id="outlined-size-small"
                  defaultValue="Small"
                  size="small"
                />
                <ClearIcon />
              </Box>
            )}
            {/* 
            <TextField
              sx={{ width: 350, maxWidth: "100%" }}
              label="Size"
              id="outlined-size-small"
              defaultValue="Small"
              size="small"
            /> */}
          </Box>
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: "10px", m: 3 }}
          >
            <Button
              sx={{ borderRadius: "20px" }}
              variant="contained"
              onClick={() => setAddNewColumn(true)}
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
