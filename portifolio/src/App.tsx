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
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/experiences" element={<AdminRoute><ExperiencesAdmin /></AdminRoute>} />
            <Route path="/admin/projects" element={<AdminRoute><ProjectsAdmin /></AdminRoute>} />
            <Route path="/admin/skills" element={<AdminRoute><SkillsAdmin /></AdminRoute>} />
            <Route path="/admin/services" element={<AdminRoute><ServicesAdmin /></AdminRoute>} />
            <Route path="/admin/user" element={<AdminRoute><UserAdmin /></AdminRoute>} />
          </Routes>

        </BrowserRouter>
      </ThemeProvider>
    </>
  );

}

export default App;
