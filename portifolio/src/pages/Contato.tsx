import { Box } from "@mui/material"
import { Header } from "../components/Header"
import { ContactSection } from "../components/sections/ContactSection"
import Footer from "../components/Footer"
import profileImg from "../assets/profile.jpeg";
import { PersonalChat } from "../components/PersonalChat";

export const Contato: React.FC = () => {
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
                <Box component='main' sx={{ flex: 1, pb: 10 }}>
                    <ContactSection />
                </Box>
                <Footer/>
                <PersonalChat
                        avatarUrl={profileImg}
                        avatarAlt="Foto do meu perfil"
                        initials="GV"
                />
            </Box>
        </>
    )
}