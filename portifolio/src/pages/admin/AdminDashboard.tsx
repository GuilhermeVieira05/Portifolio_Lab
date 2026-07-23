import React from "react";
import { Box, Typography, Card, CardActionArea, CardContent, Avatar } from "@mui/material";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import FolderCopyIcon from "@mui/icons-material/FolderCopy";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";

const SECTIONS = [
  { key: "experiences", label: "Experiências", description: "Linha do tempo profissional", icon: WorkHistoryIcon },
  { key: "projects", label: "Projetos", description: "Cards do portfólio", icon: FolderCopyIcon },
  { key: "skills", label: "Skills", description: "Tecnologias e ferramentas", icon: BuildCircleIcon },
  { key: "services", label: "Serviços", description: "O que você oferece", icon: DesignServicesIcon },
  { key: "user", label: "Dados pessoais", description: "Bio, contato e currículo", icon: PersonIcon },
];

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AdminLayout title="Painel administrativo" showBackButton={false}>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Escolha o que você quer editar. As mudanças são publicadas automaticamente no site em cerca de um minuto.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
        }}
      >
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.key} sx={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              <CardActionArea
                onClick={() => navigate(`/admin/${section.key}`)}
                sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start", p: 2, gap: 2 }}
              >
                <Avatar sx={{ bgcolor: "primary.main", color: "#0b0b0d" }}>
                  <Icon />
                </Avatar>
                <CardContent sx={{ p: "0 !important" }}>
                  <Typography variant="h6" fontWeight={600}>
                    {section.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {section.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
    </AdminLayout>
  );
};
