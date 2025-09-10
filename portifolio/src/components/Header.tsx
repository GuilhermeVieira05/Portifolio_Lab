import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { TbCircleLetterGFilled } from "react-icons/tb"; //importacao do icone de letra
import { useLocation } from "react-router-dom";
import { userData } from "../data/userData";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Drawer, IconButton, List, ListItem, ListItemButton, ListItemText, useMediaQuery, useTheme } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

export const Header = () => {

  const { t } = useTranslation();
  const location = useLocation();
  const currentPath = location.pathname;
  const user = userData
  const menuItems = [
    { label: t("header.home"), path: "/", key: "home" },
    { label: t("header.sobre"), path: "/sobre", key: "about" },
    { label: t("header.habilidades"), path: "/habilidades", key: "skills" },
    { label: t("header.projetos"), path: "/projetos", key: "projects" },
    { label: t("header.certificados"), path: "/certificados", key: "certificates" },
    { label: t("header.contato"), path: "/contato", key: "contact" },
  ];

  const [openDrawer, setOpenDrawer] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <AppBar
      position="static"
      elevation={10}
      sx={{
        display: "flex",
        justifyContent: "center",
        py: "0.5rem",
        background: "#1E1E1E",
        width: "100vw",
        //border: '2px solid red',
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.05)",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          height: "100%",
          px: { xs: 2, sm: "10%", md: "2.5%", lg: "10%" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: { xs: "0.5rem", sm: "1rem" },
          }}
        >
          <Box
            sx={{
              fontSize: { xs: "1.5rem", sm: "2rem" },
              color: "#f5f5f5",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TbCircleLetterGFilled />
          </Box>
          <Typography
            variant="h5"
            sx={{
              letterSpacing: 4,
              fontWeight: 800,
              textTransform: "uppercase",
              color: "#f5f5f5",
              fontSize: { xs: "0.9rem", sm: "1.7rem", md: "1.5rem" },
              lineHeight: 1
            }}
          >
            {user.name}
          </Typography>
        </Box>
        {/*Menu para mobile e tablets*/}
        {isMobile ? (
          <>
            <Box sx={{ display: "flex", flexDirection: "row", gap: "0.2rem" }}>
              <LanguageSwitcher></LanguageSwitcher>
              <IconButton onClick={() => setOpenDrawer(true)} sx={{ color: "#f5f5f5"}}>
                <MenuIcon />
              </IconButton>
            </Box>
            <Drawer
              anchor="top"
              open={openDrawer}
              onClose={() => setOpenDrawer(false)}
              PaperProps={{
                sx: {
                  backgroundColor: "#1e1e1e",
                  color: "#f5f5f5",
                  height: "100vh",
                  paddingTop: 2,
                  position: "relative",
                },
              }}
            >
              <IconButton
                onClick={() => setOpenDrawer(false)}
                sx={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  color: "#f5f5f5",
                }}
              >
                <CloseIcon fontSize="large" />
              </IconButton>

              <List sx={{ mt: 6 }}>
                {menuItems.map((item) => {
                  const isActive = currentPath === item.path;
                  return (
                    <ListItem key={item.key} disablePadding>
                      <ListItemButton
                        href={item.path}
                        sx={{
                          justifyContent: "center",
                          color: isActive ? "#1976d2" : "#f5f5f5",
                          fontWeight: isActive ? 700 : 500,
                          textTransform: "uppercase",
                          letterSpacing: 2,
                          "&:hover": {
                            backgroundColor: "#2c2c2c",
                          },
                        }}
                        onClick={() => setOpenDrawer(false)}
                      >
                        <ListItemText primary={item.label} />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Drawer>

          </>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            {menuItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <Button
                  key={item.key}
                  href={item.path}
                  sx={{
                    color: isActive ? "#2c2c2c" : "#f5f5f5",
                    fontWeight: 600,
                    mx: 1,
                    px: { xs: 2, sm: 2, md: 1, lg: 2 },
                    py: 0.5,
                    fontSize: { md: "12px", lg: '14px' },
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                    backgroundColor: isActive ? "#f5f5f5" : "transparent",
                    "&:hover": {
                      color: "#2c2c2c",
                      backgroundColor: "#f5f5f5",
                      transform: "translateY(-2px) scale(1.08)",
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
            <LanguageSwitcher></LanguageSwitcher>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};
