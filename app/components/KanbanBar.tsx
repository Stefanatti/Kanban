"use client";
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import { useState, FC, useEffect } from "react";
import AddTaskModal from "./AddTaskModal";

import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import AdbIcon from "@mui/icons-material/Adb";
import MoreIcon from "@mui/icons-material/MoreVert";
import { useCreateTaskMutation, Task } from "@/lib/features/tasksSlice";
import { useDeleteBoardMutation, Board } from "@/lib/features/boardSlice";
const pages = ["Products", "Pricing", "Blog"];
const settings = ["Delete Board"];

// interface Board {
//   createdAt: string;
//   title?: string;
//   lists?: {
//     title: string;
//     _id: string;
//     tasks?: Task[];
//   }[];
//   updatedAt: string;
//   __v: number;
//   _id?: string;
// }

interface KanbanBarProps {
  // addTask: (task: { id: number; name: string }) => void;
  selectedBoard: Board | undefined;
  refetchBoard: () => void;
  setSelectedBoardId: (id: string | null) => void;
}

// interface List {
//   _id: string;
//   title: string;
//   tasks?: { _id: string; title: string }[];
//   boardId?: string;
// }

// interface Task {
//   title: string;
//   description?: string;
//   dueDate?: Date;
//   completed?: Boolean | undefined;
//   subtasks?: string[];
//   _id?: string;
//}

const KanbanBar: FC<KanbanBarProps> = ({
  selectedBoard,
  refetchBoard,
  setSelectedBoardId,
}) => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [openModal, setOpenModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState<string>("");
  const [listId, setListId] = useState<string | undefined>("");
  const [selectedBoardTasks, setSelectedBoardTasks] = useState<
    Array<Task | undefined>
  >([]);
  const [createTask] = useCreateTaskMutation();
  const [deleteBoard] = useDeleteBoardMutation();
  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleCreateBoardClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    handleOpenModal();
  };
  console.log(selectedBoard);

  const handleDeleteBoard = (event: React.MouseEvent<HTMLLIElement>) => {
    event.stopPropagation();
    console.log("Delete board", selectedBoard?._id);
    if (!selectedBoard?._id) return;
    deleteBoard(selectedBoard?._id);
    setSelectedBoardId(null);
  };

  const handleCreateTask = async (
    taskName: string,
    listId: string,
    isCompleted: boolean,
    description?: string,
    subtasks?: string[]
  ): Promise<void> => {
    if (!taskName || !listId) return;

    try {
      const formattedSubtasks = subtasks?.map((subtask) => ({
        title: subtask,
        completed: false,
      }));

      const newTask = {
        title: taskName,
        listId,
        completed: isCompleted,
        description,
        subtasks: formattedSubtasks,
      };
      const createdTask = await createTask(newTask).unwrap();
      console.log(createdTask);
      // Update the tasks array with the new task
      // setSelectedBoardTasks((prevTasks) => [...prevTasks, createdTask]);
      refetchBoard();

      console.log(selectedBoardTasks);
    } catch (err) {
      console.error("Failed to create task:", err);
      // You might want to show an error notification here
    }
  };

  return (
    <>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <AdbIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              Kanban
            </Typography>

            <AdbIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontFamily: "monospace",
                fontWeight: 700,
                // letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              Board's Title
            </Typography>
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                ml: 15,
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,

                color: "inherit",
                textDecoration: "none",
              }}
            >
              {selectedBoard?.title}
            </Typography>

            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={handleCreateBoardClick}
                sx={{ width: "175px", borderRadius: "20px" }}
              >
                {" "}
                <Typography sx={{ textTransform: "capitalize" }}>
                  + Add new Task
                </Typography>
              </Button>
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton
                  size="large"
                  aria-label="display more actions"
                  edge="end"
                  color="inherit"
                  onClick={handleOpenUserMenu}

                  // sx={{ p: 3 }}
                >
                  <MoreIcon />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px", pr: 0 }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                disablePortal
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                disableScrollLock={true}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem key={setting} onClick={handleDeleteBoard}>
                    <Typography textAlign="center">{setting}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
          {openModal && (
            <div onClick={(e) => e.stopPropagation()}>
              <AddTaskModal
                open={true}
                handleClose={handleCloseModal}
                selectedBoard={selectedBoard}
                addTask={handleCreateTask}
                newTaskName={newTaskName}
                setNewTaskName={setNewTaskName}
                listId={listId}
                setListId={setListId}
              />
            </div>
          )}
        </Container>
      </AppBar>
    </>
  );
};
export default KanbanBar;
