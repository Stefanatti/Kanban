"use client";
import { useState, FC } from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import { Drawer, Typography } from "@mui/material";
import AddBoardModal from "./AddBoardModal";
import DrawerButton from "./DrawerButton";
import { useCreateBoardMutation } from "@/lib/features/boardSlice";
import { Board } from "@/app/interfaces/interfaces";

interface DrawerProps {
  // toggleDrawer: (open: boolean) => () => void;
  boards?: Board[];
  onBoardSelect: (id: string) => void;
  // createBoard: (title: string) => Promise<void>;
}

const SideBar: FC<DrawerProps> = ({ boards, onBoardSelect }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [boardName, setBoardName] = useState<string>("");
  const [createBoard, { isLoading, isError, isSuccess }] =
    useCreateBoardMutation();

  const handleCreateBoard = async (
    event: React.FormEvent<HTMLFormElement>,
    columns: string[],
  ) => {
    event.preventDefault();
    try {
      const newBoard = { title: boardName, columns } as Partial<Board> & {
        columns: string[];
      };
      await createBoard(newBoard).unwrap();
      setBoardName("");
      handleCloseModal();
    } catch (err) {
      console.error("Failed to create board:", err);
    }
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen ?? !open);
  };

  const handleCreateBoardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    handleOpenModal();
  };

  const sideBarList = (
    <Box sx={{ width: 350 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        <ListItem>
          <Typography>All Boards ({boards?.length ?? 0})</Typography>
        </ListItem>
        <Divider />

        {boards?.map((board) => (
          <ListItem key={board.id} disablePadding>
            <ListItemButton
              onClick={() => onBoardSelect(board.id)}
              sx={{
                borderRadius: "0 20px 20px 0",
                mr: 2,
                py: 1.2,
                "&:hover": {
                  backgroundColor: "primary.main",
                  color: "#fff",
                  "& .MuiListItemIcon-root": { color: "#fff" },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <InboxIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={board.title} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleCreateBoardClick}
            sx={{
              borderRadius: "0 20px 20px 0",
              mr: 2,
              py: 1.2,
              color: "primary.main",
              "&:hover": {
                backgroundColor: "primary.main",
                color: "#fff",
                "& .MuiListItemIcon-root": { color: "#fff" },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: "primary.main" }}>
              <InboxIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="+ Create New Board" />
          </ListItemButton>
        </ListItem>
      </List>
      {openModal && (
        <div onClick={(e) => e.stopPropagation()}>
          <AddBoardModal
            open={true}
            handleClose={handleCloseModal}
            createBoard={handleCreateBoard}
            boardName={boardName}
            setBoardName={setBoardName}
          />
        </div>
      )}
    </Box>
  );

  return (
    <>
      <DrawerButton toggleDrawer={toggleDrawer} />
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {sideBarList}
      </Drawer>
    </>
  );
};

export default SideBar;
