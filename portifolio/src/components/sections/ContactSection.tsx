// src/components/sections/ContactSection.tsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { GitHub } from "@mui/icons-material";
import { userData } from "../../data/userData";
import { Title } from "../Title";
import AnimatedCanvas from "../../assets/animatedBackground";
import { ContactCard } from "../ContactCard";
import { useTranslation } from "react-i18next";
import { sendEmail } from "../../api/email.Api";

export const ContactSection: React.FC = () => {
  const { t } = useTranslation();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit: React.MouseEventHandler<HTMLButtonElement> = async (
    e
  ) => {
    e.preventDefault();

    if (!nome || !email || !telefone || !mensagem) {
      alert(t("contatoSecao.alert"))
      return;
    }

    setStatus("sending");
    try {
      const response = await sendEmail(nome, email, telefone, mensagem);

      if (!response.ok) throw new Error("Erro ao enviar o email");
      setStatus("success");
      setNome("");
      setEmail("");
      setTelefone("");
      setMensagem("");
    } catch (err) {
      setStatus("error");
    }
  };

  const user = userData;

  return (
    <Box
      component="section"
      id="contact"
      sx={{
        py: {
          xs: 4,
          md: 4,


        },
        flex: 1,
        position: "relative",
        display: "flex",
        justifyContent: "center",
        gap: { xs: 0, sm: 4 },
        flexWrap: "wrap",
        flexDirection: "column",
        alignItems: "center",
        maxWidth: "100vw",
      }}
    >
      <AnimatedCanvas></AnimatedCanvas>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          alignItems: "center",
          gap: 1,
          px: { xs: 2, sm: 4, md: 0 },
          mb: { xs: 0, sm: 0, md: 6 },
          maxWidth: "100vw",
        }}
      >
        <Title
          title={t("contatoSecao.titulo")}
          subtitle={t("contatoSecao.subtitulo")}
        ></Title>
      </Box>

      <Box sx={{ display: "flex", position: "relative", gap: 1, flexDirection: { xs: "column", md: "row" }, justifyContent: "center", alignItems: "center", px: { xs: 0, md: 0 }, }}>
        <Box
          sx={{
            maxWidth: { xs: "100vw", md: 500 },
            width: { xs: "80vw", md: "auto" },
            p: { xs: 2.5, sm: 3 },
            border: "1px solid #ccc",
            borderRadius: 2,
            boxShadow: 2,
            backgroundColor: "white",
          }}
        >
          <Typography variant="h5" mb={3} fontWeight="bold" sx={{ fontSize: { xs: "20px", sm: "24px" }, textAlign: { xs: "center", sm: "start" } }}>
            {t("contatoSecao.cardEmail.titulo")}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, mb: 2 }}>
            <TextField
              label={t("contatoSecao.cardEmail.labelNome")}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              fullWidth
              sx={{
                "& label.Mui-focused": {
                  color: "#1E1E1E",
                },
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#1E1E1E",
                  },
                },
              }}
            />
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              type="email"
              sx={{
                "& label.Mui-focused": {
                  color: "#1E1E1E",
                },
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#1E1E1E",
                  },
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              label={t("contatoSecao.cardEmail.labelTelefone")}
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              fullWidth
              sx={{
                "& label.Mui-focused": {
                  color: "#1E1E1E",
                },
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#1E1E1E",
                  },
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              label={t("contatoSecao.cardEmail.labelMensagem")}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              multiline
              rows={8}
              fullWidth
              sx={{
                "& label.Mui-focused": {
                  color: "#1E1E1E",
                },
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#1E1E1E",
                  },
                },
              }}
            />
          </Box>

          <Button
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "#1E1E1E",
              borderRadius: 3,
              fontFamily: "'Segoe UI', Arial, sans-serif",
            }}
            onClick={handleSubmit}
          >
            {t("contatoSecao.cardEmail.btnTexto")}
          </Button>
          {status === "sending" && <Alert severity="info">Enviando...</Alert>}
          {status === "success" && <Alert severity="success">Email enviado com sucesso!</Alert>}
          {status === "error" && <Alert severity="error">Erro ao enviar email.</Alert>}
        </Box>

        <Box
          sx={{
            maxWidth: { xs: "100%", md: 400 },
            p: { xs: 0, md: 5 },
            pt: { xs: 5, md: 0 },
            color: "white",
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            mb={2}
            sx={{
              color: "white",
              fontSize: { xs: "30px", sm: "39px" },
              textAlign: { xs: "center", md: "start" },
            }}
          >
            {t("contatoSecao.titulo02")}
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { sm: "repeat(2, 1fr)", md: "auto" }, gap: { sm: 2, md: 0 } }}>
            <ContactCard
              icon={<EmailOutlinedIcon sx={{ color: "white" }} />}
              title="Email"
              text={user.emailName}
              link={`mailto:${user.links?.email}`}
            />

            <ContactCard
              icon={<WhatsAppIcon sx={{ color: "white" }} />}
              title="WhatsApp"
              text={user.telefone}
              link={`https://wa.me/${user.telefone}`}
            />

            <ContactCard
              icon={<LinkedInIcon sx={{ color: "white" }} />}
              title="LinkedIn"
              text={user.linkedinName}
              link={user.links?.linkedin}
            />
            <ContactCard
              icon={<GitHub sx={{ color: "white" }} />}
              title="Github"
              text={user.githubName}
              link={user.links?.github}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
