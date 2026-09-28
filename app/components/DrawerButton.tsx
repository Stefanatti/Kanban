import { Box, IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

interface ButtonDrawerProps {
  toggleDrawer: (open: boolean) => () => void;
}

const DrawerButton: React.FC<ButtonDrawerProps> = ({ toggleDrawer }) => {
  return (
    <Box sx={{ position: "fixed", bottom: 50, left: 0 }}>
      <IconButton
        aria-label="Show sidebar"
        onClick={toggleDrawer(true)}
        sx={{
          borderRadius: "0 50px 50px 0",
          backgroundColor: "primary.main",
          "&:hover": {
            backgroundColor: "primary.dark",
          },
          width: "40px",
          height: "40px",
          textAlign: "left",
        }}
      >
        <VisibilityIcon />
      </IconButton>
    </Box>
  );
};

export default DrawerButton;
