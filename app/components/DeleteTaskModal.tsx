import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

interface DeleteTaskModalProps {
  open: boolean;
  handleClose: () => void;
  taskName: string;
  onDelete: () => Promise<void>;
}

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 480,
  bgcolor: "background.paper",
  border: "2px solid #000",
  borderRadius: "10px",
  boxShadow: 24,
  p: 4,
} as const;

function DeleteTaskModal({
  open,
  handleClose,
  taskName,
  onDelete,
}: DeleteTaskModalProps): React.ReactElement {
  const handleDelete = async () => {
    await onDelete();
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="delete-task-modal-title"
    >
      <Box sx={style}>
        <Typography
          id="delete-task-modal-title"
          variant="h5"
          component="h2"
          sx={{ mb: 2, color: "error.main", fontWeight: 700 }}
        >
          Delete this task?
        </Typography>

        <Typography sx={{ mb: 3, color: "text.secondary" }}>
          Are you sure you want to delete the &quot;{taskName}&quot; task and
          its subtasks? This action cannot be reversed.
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="error"
            sx={{ borderRadius: "20px", py: 1 }}
            onClick={handleDelete}
          >
            Delete
          </Button>
          <Button
            fullWidth
            variant="outlined"
            sx={{ borderRadius: "20px", py: 1 }}
            onClick={handleClose}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default DeleteTaskModal;
