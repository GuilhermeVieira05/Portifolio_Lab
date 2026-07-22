import React from "react";
import {
  Box,
  Typography,
  Grid,
  Link,
  Divider,
  Stack,
  IconButton,
  Container,
} from "@mui/material";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { userData } from "../data/userData";
import { useTranslation } from "react-i18next";
import { localize } from "../lib/localized";

type NavLink = { text: string; href: string };

export interface FooterProps {
  navLinks?: NavLink[];
}

export const Footer: React.FC<FooterProps> = ({
}) => {
  const { t, i18n } = useTranslation();
  const links = [
    { text: t("header.home"), href: "/" },
    { text: t("header.sobre"), href: "/sobre" },
    { text: t("header.habilidades"), href: "/habilidades" },
    { text: t("header.projetos"), href: "/projetos" },
    { text: t("header.contato"), href: "/contato" },
  ];
  const currentYear = new Date().getFullYear();

  const user = userData
  const descTraduzida = localize(user.desc, i18n.language);

  const connectLinks = [
    {
      Icon: LinkedInIcon,
      text: "LinkedIn",
      href: user.links?.linkedin
    },
    { Icon: GitHubIcon, text: "GitHub", href: user.links?.github },
    {
      Icon: WhatsAppIcon,
      text: "WhatsApp",
      href: `https://wa.me/${user.telefone}?text=Ol%C3%A1%2C%20tudo%20bem%3F%20Gostaria%20de%20saber%20mais%20sobre%20voc%C3%AA.`
    },
    { Icon: MailOutlineIcon, text: "Gmail", href: `mailto:${user.links?.email}` },
  ]


  return (
    <Box
      component="footer"
      sx={{
        py: { xs: 6, md: 5 },
        bgcolor: "#1E1E1E",
        color: "#F5F5F5",
      }}
    >
      <Container maxWidth="lg">
        <Grid
          container
          spacing={{ xs: 4, md: 8 }}
          justifyContent="space-between" // distribui espaçamentos iguais entre as colunas
        >
          {/* Coluna 1 */}
          <Grid sx={{ minWidth: 0 }}>
            <Stack spacing={2}>
              <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
                {user.name}
              </Typography>

              <Typography
                variant="body2"
                color="#F5F5F5"
                sx={{
                  // Garante quebra correta sem deformar o layout
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  wordWrap: "break-word",
                  hyphens: "auto",
                  whiteSpace: "normal",
                }}
              >
                {descTraduzida}
              </Typography>

              <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
                {connectLinks.map(({ Icon, href, text }, idx) => (
                  <IconButton
                    key={idx}
                    aria-label={text}
                    component="a"
                    href={href}
                    rel="noopener noreferrer"
                    sx={{
                      color: "#F5F5F5",
                      p: 0,
                      transition:
                        "transform .2s ease-in-out, color .2s ease-in-out",
                      "&:hover": {
                        color: "primary.main",
                        transform: "scale(1.1)",
                      },
                    }}
                  >
                    <Icon fontSize="medium" />
                  </IconButton>
                ))}
              </Stack>
            </Stack>
          </Grid>

          {/* Coluna 2 */}
          <Grid sx={{ minWidth: 0 }}>
            <Stack spacing={1.5}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                {t("footer.navegacao")}
              </Typography>
              {links.map(({ text, href }, idx) => (
                <Link
                  key={idx}
                  href={href}
                  color="inherit"
                  underline="none"
                  sx={{
                    "&:hover": {
                      color: "primary.main",
                      textDecoration: "underline",
                    },
                  }}
                >
                  <Typography variant="body2">{text}</Typography>
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Coluna 3 */}
          <Grid sx={{ minWidth: 0 }}>
            <Stack spacing={1.5}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                {t("footer.conecte")}
              </Typography>
              {connectLinks.map(({ Icon, text, href }, idx) => (
                <Link
                  key={idx}
                  href={href}
                  color="inherit"
                  underline="none"
                  rel="noopener noreferrer"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    "&:hover": {
                      color: "primary.main",
                      textDecoration: "underline",
                    },
                  }}
                >
                  <Icon sx={{ mr: 1, fontSize: "1.25rem" }} />
                  <Typography variant="body2">{text}</Typography>
                </Link>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: { xs: 4, md: 6, backgroundColor: "rgba(255, 255, 255, 0.1)" } }} />

        <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
          <Typography variant="body2" color="#F5F5F5">
            © {currentYear} {user.name}. {t("footer.direitos")}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
