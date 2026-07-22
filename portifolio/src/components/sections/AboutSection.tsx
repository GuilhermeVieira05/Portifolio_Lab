// src/components/sections/AboutSection.tsx
import React from "react";
import { Box, Container, Typography, Stack, Avatar } from "@mui/material";
import { userData } from "../../data/userData";
import { useTranslation } from "react-i18next";
import { localize } from "../../lib/localized";

export const AboutSection: React.FC = () => {
  const { t, i18n } = useTranslation()
  const user = userData
  const descTraduzida = localize(user.desc, i18n.language);
  return (
    <Box component="section" id="about" sx={{ py: { xs: 8, md: 12 }, bgcolor: "#2c2c2c" }}>
      <Container maxWidth="lg">
        <Stack spacing={3} alignItems="center" textAlign="justify">
          <Avatar
            alt="Foto de Perfil"
            src={user.img}
            sx={{ width: 260, height: 260 }}
          />
          <Typography variant="h3" component="h2" fontWeight={700} sx={{ color: "#fff", fontSize: { xs: "30px", sm: "39px", md: '48px' } }}>
            {t("sobreSecao.titulo")}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ color: "#fff", fontSize: { xs: "16px", sm: "18px", md: '20px' } }}>
            {descTraduzida}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};