import { Box, Container } from "@mui/material"
import { Header } from "../components/Header"
import Footer from "../components/Footer"
import { SkillsSection } from "../components/sections/SkillsSection"

export const Habilidades: React.FC = () => {
    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: "100vh",
                    bgcolor: "#2a2a2a",
                    color: "text.primary",
                    scrollBehavior: "smooth",
                }}
            >
                <Header></Header>
                <Box component='main' sx={{ flex: 1 }}>
                    <Container sx={{ py: 4 }}>
                        <SkillsSection />
                    </Container>
                </Box>
                <Footer/>
            </Box>
        </>
    )
}