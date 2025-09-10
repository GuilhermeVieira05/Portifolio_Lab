import { Box } from "@mui/material"
import { Header } from "../components/Header"
import Footer from "../components/Footer"
import { PersonalChat } from "../components/PersonalChat"
import profileImg from "../assets/profile.jpeg"
import { CertificatesSection } from "../components/sections/CertificatesSection"

export const Certificados: React.FC = () => {
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
                }}>

                <Header />
                <Box component='main' sx={{ flex: 1, pb: 10 }}>
                    <CertificatesSection />
                </Box>

                <Footer />
                <PersonalChat
                avatarUrl={profileImg}
                avatarAlt="Foto do meu perfil"
                initials="GV"
                />
            </Box>
        </>
    )
}