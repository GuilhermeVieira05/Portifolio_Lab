import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

import PublicIcon from '@mui/icons-material/Public';
import AppsIcon from '@mui/icons-material/Apps';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WebAssetIcon from '@mui/icons-material/WebAsset';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { TbClock } from 'react-icons/tb';
import { Check } from '@mui/icons-material';

import type { CardType, ProjectType } from '../Types/cardType';
import { ProjectModal } from './ProjectModal';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import { localize } from '../lib/localized';
import i18n from '../i18n';
// Helper para ícone do tipo
const getTypeIcon = (type: ProjectType) => {
  switch (type) {
    case 'Sites': case "Websites": return <PublicIcon />;
    case 'Landing Pages': return <WebAssetIcon />;
    case 'Aplicativos': case "Apps": return <AppsIcon />;
    case 'E-Commerce': return <ShoppingCartIcon />;
    default: return <HelpOutlineIcon />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Em Andamento': case "In Progress": return <TbClock />;
    case 'Finalizado': case "Finished": return <Check />;
    default: return <HelpOutlineIcon />;
  }
};

const getColor = (status: string) => {
  switch (status) {
    case 'Em Andamento': case "In Progress": return '#fb8c00';
    case 'Finalizado': case "Finished": return '#4db6ac';
    default: return 'default';
  }
}

interface ProjectCardProps {
  project: CardType;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const maxLanguages = 3;
  const showLanguages = project.languages.slice(0, maxLanguages);
  const moreCount = project.languages.length - maxLanguages;

  return (
    <>
      <Card
        sx={{
          maxWidth: 360,
          bgcolor: 'grey.900',
          color: 'common.white',
          borderRadius: 2,
          display: 'flex', flexDirection: 'column',
        }}
      >
        <CardMedia
          sx={{
            height: 180,
            borderTopLeftRadius: 8, borderTopRightRadius: 8,
            objectFit: 'cover',
            backgroundColor: 'rgba(30, 30, 30, .8)'
          }}
          image={project.image || "https://via.placeholder.com/400x180/303030/FFFFFF?text=No+Image"}
          title={localize(project.title, i18n.language)}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Chip
            icon={getTypeIcon(project.type)}
            label={project.type}
            size="small"
            sx={{
              mb: 2, bgcolor: 'primary.main',
              color: 'white', fontWeight: 'bold',
              '.MuiChip-icon': { color: 'white' }
            }}
          />
          <Chip
            icon={getStatusIcon(localize(project.status, i18n.language))}
            label={localize(project.status, i18n.language)}
            size="small"
            sx={{
              mb: 2, bgcolor: getColor(localize(project.status, i18n.language)),
              color: 'white', fontWeight: 'bold',
              '.MuiChip-icon': { color: 'white' }
            }}
          />
          </Box>
          <Typography gutterBottom variant="h5" fontWeight="bold">
            {localize(project.title, i18n.language)}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#93A3AF',
              mb: 2,
              display: '-webkit-box',
              lineHeight: "1.5rem",
              maxHeight: "3.75rem",
              overflow: "hidden",
            }}
          >
            {localize(project.description, i18n.language)}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
            {showLanguages.map((lang, i) => (
              <Chip
                key={i}
                label={lang}
                size="small"
                sx={{ bgcolor: 'grey.700', color: 'white', fontWeight: 500 }}
              />
            ))}
            {moreCount > 0 && (
              <Chip
                label={`+${moreCount}`}
                size="small"
                sx={{ bgcolor: 'grey.700', color: 'white', fontWeight: 500 }}
              />
            )}
          </Stack>
        </CardContent>
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            variant="contained"
            fullWidth
            size="medium"
            onClick={handleOpen}
            endIcon={<ArrowForwardIcon />}
            sx={{
              bgcolor: 'grey.700',
              color: 'white',
              fontWeight: 'bold',
              textTransform: 'none',
              py: 1.5,
              borderRadius: 2,
              '&:hover': { bgcolor: 'grey.800' }
            }}
          >
           {t("projects.btnTexto")}
          </Button>
        </CardActions>
      </Card>

      <ProjectModal open={open} handleClose={handleClose} project={project} />
    </>
  );
};