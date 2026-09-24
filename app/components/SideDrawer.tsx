"use client";
import { useState, useLayoutEffect, FC } from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { Drawer, Switch, Typography } from "@mui/material";
import AddBoardModal from "./AddBoardModal";
import DrawerButton from "./DrawerButton";
import { useCreateBoardMutation } from "@/lib/features/boardSlice";
import { Board } from "@/app/interfaces/interfaces";
import { useThemeMode } from "@/app/ThemeContext";

interface DrawerProps {
  // toggleDrawer: (open: boolean) => () => void;
  boards?: Board[];
  onBoardSelect: (id: string) => void;
  // createBoard: (title: string) => Promise<void>;
}

const SideBar: FC<DrawerProps> = ({ boards, onBoardSelect }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [navbarBottom, setNavbarBottom] = useState(0);

  useLayoutEffect(() => {
    if (!open) return;
    const navbar = document.getElementById("kanban-navbar");
    if (!navbar) return;
    const updateOffset = () => {
      setNavbarBottom(Math.max(0, navbar.getBoundingClientRect().bottom));
    };
    updateOffset();
    const observer = new ResizeObserver(updateOffset);
    observer.observe(navbar);
    window.addEventListener("resize", updateOffset);
    window.addEventListener("scroll", updateOffset, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateOffset);
      window.removeEventListener("scroll", updateOffset, true);
    };
  }, [open]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [boardName, setBoardName] = useState<string>("");
  const [createBoard] = useCreateBoardMutation();
  const { mode, toggleTheme } = useThemeMode();

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
    <Box
      sx={{
        width: 320,
        maxWidth: "100vw",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "100%",
      }}
      role="presentation"
      onClick={toggleDrawer(false)}
    >
      <List>
        <ListItem>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            All Boards ( {boards?.length ?? 0} )
          </Typography>
        </ListItem>
        <Divider sx={{ mt: 2, mb: 2 }} />

        {boards?.map((board) => (
          <ListItem key={board.id} disablePadding sx={{ mb: 0.5, mt: 2 }}>
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
                <FormatListBulletedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={board.title}
                primaryTypographyProps={{ fontWeight: 700, fontSize: "15px" }}
              />
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
              <FormatListBulletedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="+ Create New Board"
              primaryTypographyProps={{ fontWeight: 700, fontSize: "15px" }}
            />
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

      {/* Theme Toggle */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          mx: 2,
          mt: 3,
          mb: 2,
          py: 1.5,
          borderRadius: "6px",
          backgroundColor: "background.default",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <LightModeIcon sx={{ color: "#828FA3", fontSize: 20 }} />
        <Switch
          checked={mode === "dark"}
          onChange={toggleTheme}
          color="primary"
          size="small"
        />
        <DarkModeIcon sx={{ color: "#828FA3", fontSize: 20 }} />
      </Box>
    </Box>
  );

  return (
    <>
      <DrawerButton toggleDrawer={toggleDrawer} />
      <Drawer
        open={open}
        onClose={toggleDrawer(false)}
        sx={{
          top: navbarBottom,
          "& .MuiBackdrop-root": { top: navbarBottom },
          "& .MuiDrawer-paper": {
            top: navbarBottom,
            height: `calc(100dvh - ${navbarBottom}px)`,
            bgcolor: "background.paper",
          },
        }}
      >
        {sideBarList}
      </Drawer>
    </>
  );
};

export default SideBar;
