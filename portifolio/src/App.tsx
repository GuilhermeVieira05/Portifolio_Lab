import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Sobre } from "./pages/Sobre";
import { Habilidades } from "./pages/Habilidades";
import { Projetos } from "./pages/Projetos";
import { Contato } from "./pages/Contato";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Certificados } from "./pages/Certificados";

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
            <Route path="/certificados" element={<Certificados />} />
            <Route path="/contato" element={<Contato />} />
          </Routes>

        </BrowserRouter>
      </ThemeProvider>
    </>
  );

}

export default App;
