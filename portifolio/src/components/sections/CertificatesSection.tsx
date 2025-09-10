// src/components/sections/ProjectsSection.tsx
import React, { useMemo, useState } from "react";
import {
  Box,
  Container,
  Grid,
} from "@mui/material";
import { certificates } from "../../data/certificatesData";
import { Title } from "../Title";
import { useTranslation } from "react-i18next";
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { CertificateCard } from "../certificateCard";


export const CertificatesSection: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Box component="section" id="certificates" sx={{ py: { xs: 8, md: 8 }, pt: { xs: 0 } }}>
      <Container maxWidth="lg">
        <Title title={t("projetosSecao.titulo")} subtitle={t("projetosSecao.subtitulo")} ></Title>
        {certificates.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", textAlign: {xs: "center", md: "start"}, py: 6 }}>
            <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", textAlign: {xs: "center", md: "start"}, flexDirection: {xs: "column", sm: "row"}, gap: 1, px: {xs: 2, sm:4}, py: 2, color: "#f5f5f5", border: "2px solid #f5f5f5", bgcolor: "transparent", borderRadius: "8px", width: {xs: "80%", md: "80%", lg:"40%"}}}>
              <ReportProblemIcon sx={{}}/>
              Nenhum certificado encontrado!
            </Box>
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ justifyContent: "center" }}>
            {certificates.map((c) => (
              <Grid key={c.id} columns={{ xs: 12, sm: 6, md: 4 }}>
                <CertificateCard certificate={c} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};
