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
  onBoardSelect: (id: string) => () => void;
  // createBoard: (title: string) => Promise<void>;
}

const SideBar: FC<DrawerProps> = ({ boards, onBoardSelect }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [boardName, setBoardName] = useState<string>("");
  const [createBoard, { isLoading, isError, isSuccess }] =
    useCreateBoardMutation();

  const handleCreateBoard = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const newBoard = { title: boardName } as Partial<Board>;
      await createBoard(newBoard).unwrap(); // `unwrap` handles errors gracefully
      setBoardName("");
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
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        <ListItem>
          <Typography>All Boards (0)</Typography>
        </ListItem>
        <Divider />

        {boards?.map((board) => (
          <ListItem key={board._id} disablePadding>
            <ListItemButton onClick={() => onBoardSelect(board._id)}>
              <ListItemText primary={board.title} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem>
          <ListItemButton onClick={handleCreateBoardClick}>
            <ListItemIcon>
              {<InboxIcon />}

              <Typography>+ Create new board</Typography>
            </ListItemIcon>
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
