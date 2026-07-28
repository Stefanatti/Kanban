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
import { useCreateTaskMutation } from "@/lib/features/tasksSlice";
import { Board, Task } from "@/app/interfaces/interfaces";

const pages = ["Products", "Pricing", "Blog"];
const settings = ["Profile", "Account", "Dashboard", "Logout"];

interface KanbanBarProps {
  selectedBoard: Board | undefined;
}

const KanbanBar: FC<KanbanBarProps> = ({ selectedBoard }) => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [openModal, setOpenModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState<string>("");
  const [listId, setListId] = useState<string | undefined>("");
  const [selectedBoardTasks, setSelectedBoardTasks] = useState<
    Array<Task | undefined>
  >([]);
  const [createTask] = useCreateTaskMutation();

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
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    handleOpenModal();
  };

  console.log(selectedBoard);

  useEffect(() => {
    if (selectedBoard) {
      setSelectedBoardTasks(
        selectedBoard.lists?.flatMap((list) => list.tasks || []) || [],
      );
    }
  }, [selectedBoard]);

  const handleCreateTask = async (
    taskName: string,
    listId?: string,
    description?: string,
    subtasks?: string[],
  ): Promise<void> => {
    if (!taskName || !listId) return;

    try {
      const newTask = { title: taskName, listId, description, subtasks };
      const createdTask = await createTask(newTask).unwrap();
      setSelectedBoardTasks((prevTasks) => [...prevTasks, createdTask]);
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  // const handleCreateTask = async (taskName: string, listId?: string) => {
  //   try {
  //     if (taskName && listId) {
  //       console.log(`Creating task "${taskName}" in list "${listId}"`);

  //       const newTask = {
  //         title: taskName,
  //         listId,
  //       };

  //       // Create task in the backend
  //       const theNewTask = await createTask(newTask).unwrap();
  //       console.log(theNewTask);
  //       //  setSelectedBoardTasks((prevTasks) => [...prevTasks, response.data]);
  //       // setNewTaskName("");
  //       // setListId("");
  //     }
  //   } catch (err) {
  //     console.error("Failed to submit changes:", err);
  //   }
  // };

  // const handleCreateTask = async (taskName: string, listId?: string) => {
  //   try {
  //     if (taskName && listId) {
  //       const newTask = { title: taskName, listId };
  //       //await createTask(newTask).unwrap();
  //       // setNewTaskName("");
  //       // setSelectedBoardTasks((prevTasks) => [...prevTasks, newTask]);
  //     }
  //   } catch (err) {
  //     console.error("Failed to submit changes:", err);
  //   }
  // };

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
            {/* <Box
              sx={{ display: { xs: "flex", md: "none" }, flexGrow: 1, mr: 5 }}
            >
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                disablePortal
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: "block", md: "none" },
                }}
              >
                {pages.map((page) => (
                  <MenuItem key={page} onClick={handleCloseNavMenu}>
                    <Typography textAlign="center">{page}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box> */}
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

              {/* {pages.map((page) => (
              <Button
                key={page}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                {page}
              </Button>
            ))} */}
            </Box>

            {/* THREE DOTS!! */}

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
                  <MenuItem key={setting} onClick={handleCloseUserMenu}>
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
