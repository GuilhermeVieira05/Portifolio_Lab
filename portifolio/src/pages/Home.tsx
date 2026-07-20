// src/pages/Home.tsx
import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import Button from "@mui/material/Button";
import DownloadIcon from '@mui/icons-material/Download';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import AnimatedCanvas from "../assets/animatedBackground/index.tsx";
import { HighLightsSection } from "../components/sections/HighLightsSection.tsx";
import { useTranslation } from "react-i18next";
import { health } from "../api/healthApi.ts";
import { userData } from "../data/userData.ts";
import ServicesSection from "../components/sections/ServicesSection.tsx";
import i18n from "../i18n.ts";
import { useTypewriter } from "../hooks/useTypewriter";

function isFirstVisitThisSession() {
  return !sessionStorage.getItem('visited_session');
}
function markVisitedSession() {
  sessionStorage.setItem('visited_session', '1');
}

export const Home: React.FC = () => {

  const { t } = useTranslation();

  const user = userData

  const palavrasTraduzidas = user.caracteristicas.map((c) => t(c));

  const { text: typedText, started: typedStarted } = useTypewriter(palavrasTraduzidas, {
    typingSpeed: 70,
    deletingSpeed: 50,
    pauseTime: 1500,
    startDelay: 300,
    loop: true,
  });

  document.addEventListener('DOMContentLoaded', () => {
    if (isFirstVisitThisSession()) {
      health();
    }
    markVisitedSession();
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        scrollBehavior: "smooth",
      }}
    >
      <Header />
      <Box component="main" sx={{ flex: 1, width: "100vw" }}>
        {/* Hero opcional */}
        <Box
          component="section"
          id="hero"
          sx={{
            flex: 1,
            position: "relative",
            py: { xs: 8, md: 12 },
            backgroundColor: "#2c2c2c",
            width: "100vw",
            height: "70.5vh",
            justifyContent: "center",
            alignItems: "center",
            alignContent: "center",
          }}
        >
          <AnimatedCanvas></AnimatedCanvas>
          <Box sx={{
            position: "relative",
            zIndex: 1
          }}>
            <Container maxWidth="md" sx={{ textAlign: "center" }}>
              {/* Linha 1: Seu nome */}
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "clamp(2rem, 10vw, 4rem)", md: "6rem" },
                  fontFamily: "'Poppins', sans-serif",
                  whiteSpace: "nowrap",
                  color: "#f5f5f5",
                  textShadow: `
      0 0 6px rgba(245, 245, 245, 0.25),
      0 0 12px rgba(245, 245, 245, 0.2)
    `
                }}
              >
                {user.name}
              </Typography>

              {/* Linha 2: "Desenvolvedor " + palavra animada */}
              <Typography
                variant="h5"
                component="h2"
                color="#F5F5F5"
                sx={{
                  fontWeight: 600,
                  display: "flex",
                  flexDirection: i18n.language === "pt" ? "row" : "row-reverse",
                  justifyContent: "center",
                  alignItems: "center",
                  lineHeight: 1,
                  gap: 1,
                  fontSize: { xs: "clamp(1.125rem, 5vw, 2rem)", md: "2rem" },
                  textShadow: `
      0 0 4px rgba(245, 245, 245, 0.2),
      0 0 8px rgba(245, 245, 245, 0.15)
    `
                }}
                aria-live="polite"
                aria-atomic="true"
              >
                <Box component="span">{t("home.desenvolvedor")}</Box>
                <Box
                  component="span"
                  sx={{
                    fontFamily: "Ubuntu, monospace",
                    fontWeight: 700,
                    color: "#36BCF7FF",
                    textShadow: `
        0 0 5px rgba(54, 188, 247, 0.7),
        0 0 10px rgba(54, 188, 247, 0.6),
        0 0 20px rgba(54, 188, 247, 0.5),
        0 0 40px rgba(54, 188, 247, 0.4)
      `,
                    "&::after": {
                      content: '"|"',
                      marginLeft: "2px",
                      opacity: typedStarted ? 1 : 0,
                      animation: "blink 1s step-end infinite",
                    },
                    "@keyframes blink": {
                      "50%": { opacity: 0 },
                    },
                  }}
                >
                  {typedText}
                </Box>
              </Typography>

            </Container>
            <Container maxWidth='sm' sx={{
              display: 'flex',
              justifyContent: 'center',
              flexDirection: { xs: "column", sm: "row" },
              width: { xs: "68%", sm: "100%" },
              gap: { xs: "0.8rem", sm: '1rem' },
              mt: '1.7rem',
              border: 'none'
            }}>
              {/*Mudar aqui o caminho se necessario para o novo curriculo*/}
              <Button
                component="a"
                href={user.curriculo}
                download
                sx={{
                  color: "#2c2c2c",
                  backgroundColor: "#fff",
                  fontWeight: 600,
                  px: { xs: 1, sm: 2 },
                  py: { xs: 1, sm: 1 },
                  gap: '6px',
                  borderRadius: "8px",
                  transition: "all 0.2s ease",
                  fontSize: { xs: "0.8rem", sm: '0.9rem' },
                  lineHeight: 1,
                  border: "none",
                  "&:hover": {
                    color: "#2c2c2c",
                    transform: "translateY(-2px) scale(1.08)",
                  },
                }}
              >

                <DownloadIcon sx={{ fontSize: { xs: "1.1rem", sm: "1.4rem" } }} />

                {t("home.btnTexto01")}
              </Button>
              <Button
                href="/contato"
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  color: "#f5f5f5",
                  backgroundColor: "transparent",
                  fontWeight: 600,
                  gap: '10px',
                  px: { xs: 1, sm: 2 },
                  py: 1,
                  borderRadius: "8px",
                  fontSize: { xs: "0.8rem", sm: '0.9rem' },
                  transition: "all 0.2s ease",
                  border: "2px solid #f5f5f5",
                  justifyContent: "center",
                  alignContent: "center",
                  alignItems: 'center',
                  lineHeight: 1,
                  "&:hover": {
                    color: "#fff",
                    backgroundColor: "#2c2c2c",
                    transform: "translateY(-2px) scale(1.08)",
                  },
                }}
              >
                <span style={{ display: "flex", alignItems: "center" }}>
                  {t("home.btnTexto02")}
                </span>
                <ArrowCircleRightIcon sx={{ fontSize: { xs: "1.1rem", sm: "1.4rem" } }} />
              </Button>
            </Container>
          </Box>
        </Box>

        <HighLightsSection></HighLightsSection>
        <ServicesSection></ServicesSection>
      </Box>

      <Footer />
    </Box >
  )
}