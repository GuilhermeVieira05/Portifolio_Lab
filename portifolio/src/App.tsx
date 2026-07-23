import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Sobre } from "./pages/Sobre";
import { Habilidades } from "./pages/Habilidades";
import { Projetos } from "./pages/Projetos";
import { Contato } from "./pages/Contato";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminRoute } from "./pages/admin/AdminRoute";
import { ExperiencesAdmin } from "./pages/admin/ExperiencesAdmin";
import { ProjectsAdmin } from "./pages/admin/ProjectsAdmin";
import { SkillsAdmin } from "./pages/admin/SkillsAdmin";
import { ServicesAdmin } from "./pages/admin/ServicesAdmin";
import { UserAdmin } from "./pages/admin/UserAdmin";
import { AdminThemeProvider } from "./pages/admin/AdminThemeProvider";
import { createTheme, ThemeProvider } from "@mui/material/styles";

function App() {

  const theme = createTheme({
    typography: {
      fontFamily: "'Ubuntu',sans-serif",
    },
  });

  return (
    <>
      <ThemeProvider theme={theme}>
        <BrowserRouter>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/habilidades" element={<Habilidades />} />
            <Route path="/projetos" element={<Projetos />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="/admin/login" element={<AdminThemeProvider><AdminLogin /></AdminThemeProvider>} />
            <Route path="/admin" element={<AdminThemeProvider><AdminRoute><AdminDashboard /></AdminRoute></AdminThemeProvider>} />
            <Route path="/admin/experiences" element={<AdminThemeProvider><AdminRoute><ExperiencesAdmin /></AdminRoute></AdminThemeProvider>} />
            <Route path="/admin/projects" element={<AdminThemeProvider><AdminRoute><ProjectsAdmin /></AdminRoute></AdminThemeProvider>} />
            <Route path="/admin/skills" element={<AdminThemeProvider><AdminRoute><SkillsAdmin /></AdminRoute></AdminThemeProvider>} />
            <Route path="/admin/services" element={<AdminThemeProvider><AdminRoute><ServicesAdmin /></AdminRoute></AdminThemeProvider>} />
            <Route path="/admin/user" element={<AdminThemeProvider><AdminRoute><UserAdmin /></AdminRoute></AdminThemeProvider>} />
          </Routes>

        </BrowserRouter>
      </ThemeProvider>
    </>
  );

}

export default App;
