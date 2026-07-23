import React from "react";
import { AppBar, Toolbar, Box, Container, Typography, IconButton, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { logout } from "../../api/adminApi";

type Props = {
  title: string;
  children: React.ReactNode;
  /** Set to false on the dashboard itself, where there's nothing to go back to. */
  showBackButton?: boolean;
};

export const AdminLayout: React.FC<Props> = ({ title, children, showBackButton = true }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Toolbar sx={{ gap: 1 }}>
          {showBackButton && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="voltar"
              onClick={() => navigate("/admin")}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {title}
          </Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
        {children}
      </Container>
    </Box>
  );
};
