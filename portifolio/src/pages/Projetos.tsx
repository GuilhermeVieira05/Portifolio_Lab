import { Box } from "@mui/material";
import type React from "react";
import { Header } from "../components/Header";
import { ProjectsSection } from "../components/sections/ProjectsSection";
import Footer from "../components/Footer";
import { SkillsSection } from "../components/sections/SkillsSection";


export const Projetos: React.FC = () => {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          bgcolor: "#2c2c2c",
          color: "text.primary",
          scrollBehavior: "smooth",
        }}
      >
        <Header />
        <Box component="main" sx={{ flex: 1 }}>
          <ProjectsSection />
        </Box>
        <Box>
          <SkillsSection />
        </Box>
        <Footer />
      </Box>
    </>
  );
};