// src/components/sections/EstatitcSection.tsx
import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { StatsPanel } from "../../components/EstatisticComponent";
import { useTranslation } from "react-i18next";

export const EstatitcSection: React.FC = () => {
  const { t } = useTranslation()
  return (
    <Box component="section" id="statistics" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          component="h2"
          fontWeight={700}
          textAlign="center"
          mb={4}
          sx={{ color: "#fff", fontSize: { xs: "30px", sm: "39px", md: '48px' } }}
        >
          {t("estatisticasSecao.titulo")}
        </Typography>

        <StatsPanel
          title={t("estatisticasSecao.titulo").toUpperCase()}
          items={[
            { label: t("estatisticasSecao.estatisticas.projetos"), value: 10, plus: true },
            { label: t("estatisticasSecao.estatisticas.anos"), value: 2, plus: true },
            { label: t("estatisticasSecao.estatisticas.clientes"), value: 5, plus: true },
            { label: t("estatisticasSecao.estatisticas.dedicacao"), value: 110, suffix: "%", decimals: 10 },
          ]}
          satisfaction={98}
          satisfactionLabel={t("estatisticasSecao.estatisticas.satisfacao")}
        />
      </Container>
    </Box>
  );
};
