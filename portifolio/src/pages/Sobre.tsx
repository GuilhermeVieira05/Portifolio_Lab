import { Box, Divider } from "@mui/material"
import { Header } from "../components/Header"
import { AboutSection } from "../components/sections/AboutSection"
import { ExperienceSection } from "../components/sections/ExperienceSection"
import Footer from "../components/Footer"
import { EstatitcSection } from "../components/sections/EstatistcSection"


export const Sobre: React.FC = () => {
    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: "100vh",
                    bgcolor: "#2c2c2c",
                    color: "text.primary",
                    scrollBehavior: "smooth",
                }}
            >
                <Header />
                <Box component='main' sx={{ flex: 1 }}>
                    <AboutSection />
                    <Divider />
                    <ExperienceSection />
                    <Divider />
                    <EstatitcSection />
                </Box>
                <Footer                />
            </Box>
        </>
    )
}