import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { IconButton, TextField } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { List } from "@/app/interfaces/interfaces";

interface ColumnEntry {
  id: string | null; // null means it's a new column
  title: string;
}

interface EditBoardModalProps {
  open: boolean;
  handleClose: () => void;
  boardName: string;
  boardColumns: List[];
  onSave: (data: {
    boardName: string;
    columnsToKeep: { id: string; title: string }[];
    columnsToAdd: string[];
    columnsToDelete: string[];
  }) => Promise<void>;
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
  display: "flex",
  flexDirection: "column",
  gap: 3,
} as const;

function EditBoardModal({
  open,
  handleClose,
  boardName: initialBoardName,
  boardColumns,
  onSave,
}: EditBoardModalProps): React.ReactElement {
  const [boardName, setBoardName] = useState(initialBoardName);
  const [columns, setColumns] = useState<ColumnEntry[]>([]);
  const [deletedColumnIds, setDeletedColumnIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Initialize columns from boardColumns prop
  useEffect(() => {
    setColumns(boardColumns.map((col) => ({ id: col.id, title: col.title })));
    setDeletedColumnIds([]);
  }, [boardColumns]);

  // Get a smart placeholder suggestion for a new column
  const getSuggestedPlaceholder = (): string => {
    const allTitles = columns.map((c) => c.title.toLowerCase());
    if (!allTitles.includes("to do")) return "To Do";
    if (!allTitles.includes("doing")) return "Doing";
    if (!allTitles.includes("done")) return "Done";
    return "New Column";
  };

  const handleDeleteColumn = (index: number) => {
    const column = columns[index];
    if (column.id) {
      setDeletedColumnIds((prev) => [...prev, column.id!]);
    }
    setColumns((prev) => prev.filter((_, i) => i !== index));
  };

  const handleColumnTitleChange = (index: number, newTitle: string) => {
    setColumns((prev) =>
      prev.map((col, i) => (i === index ? { ...col, title: newTitle } : col)),
    );
  };

  const handleAddColumn = () => {
    setColumns((prev) => [...prev, { id: null, title: "" }]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const columnsToKeep = columns
        .filter((col) => col.id !== null)
        .map((col) => ({ id: col.id!, title: col.title }));

      const columnsToAdd = columns
        .filter((col) => col.id === null && col.title.trim() !== "")
        .map((col) => col.title.trim());

      await onSave({
        boardName,
        columnsToKeep,
        columnsToAdd,
        columnsToDelete: deletedColumnIds,
      });
      handleClose();
    } catch (err) {
      console.error("Failed to save board changes:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      sx={{ overflow: "auto" }}
      open={open}
      onClose={handleClose}
      aria-labelledby="edit-board-modal-title"
    >
      <Box sx={style}>
        <Typography
          id="edit-board-modal-title"
          variant="h5"
          component="h2"
          sx={{ mb: 2 }}
        >
          Edit Board
        </Typography>

        {/* Board Name */}
        <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>
          Board Name
        </Typography>
        <TextField
          fullWidth
          size="small"
          value={boardName}
          onChange={(e) => setBoardName(e.target.value)}
          sx={{ mb: 3 }}
        />

        {/* Board Columns */}
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Board Columns
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2 }}>
          {columns.map((column, index) => (
            <Box
              key={column.id ?? `new-${index}`}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <TextField
                fullWidth
                size="small"
                value={column.title}
                onChange={(e) => handleColumnTitleChange(index, e.target.value)}
                placeholder={
                  column.id === null ? getSuggestedPlaceholder() : ""
                }
              />
              <IconButton
                size="small"
                onClick={() => handleDeleteColumn(index)}
                sx={{ color: "grey.500", "&:hover": { color: "error.main" } }}
              >
                <ClearIcon />
              </IconButton>
            </Box>
          ))}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 2 }}>
          <Button
            sx={{ borderRadius: "20px" }}
            variant="outlined"
            onClick={handleAddColumn}
            type="button"
          >
            + Add New Column
          </Button>
          <Button
            sx={{ borderRadius: "20px" }}
            variant="contained"
            onClick={handleSave}
            disabled={saving || !boardName.trim()}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default EditBoardModal;
