import React from "react";
import { Box, Container, Typography, Card, CardActionArea, CardContent, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { logout } from "../../api/adminApi";

const SECTIONS = [
  { key: "experiences", label: "Experiências" },
  { key: "projects", label: "Projetos" },
  { key: "skills", label: "Skills" },
  { key: "services", label: "Serviços" },
  { key: "user", label: "Dados pessoais e currículo" },
];

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#2c2c2c", py: 6 }}>
      <Container maxWidth="md">
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Typography variant="h4" sx={{ color: "#fff" }}>Admin</Typography>
          <Button
            variant="outlined"
            onClick={async () => {
              await logout();
              navigate("/admin/login");
            }}
          >
            Sair
          </Button>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          {SECTIONS.map((section) => (
            <Card key={section.key}>
              <CardActionArea onClick={() => navigate(`/admin/${section.key}`)}>
                <CardContent>
                  <Typography variant="h6">{section.label}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
};
