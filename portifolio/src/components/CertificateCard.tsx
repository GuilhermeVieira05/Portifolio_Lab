import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { TbClock } from 'react-icons/tb';
import { Check, Download } from '@mui/icons-material';

import { ProjectModal } from './ProjectModal';
import { useTranslation } from 'react-i18next';
import { Box, Modal } from '@mui/material';
import type { CertificateType } from '../Types/certificateType';
import PdfModalViewer from './PdfViewerModal';

interface CertificateCardProps {
  certificate: CertificateType;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ certificate }) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false);
  const [openViewer, setOpenViewer] = useState(false);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Card
        sx={{
          maxWidth: 500,
          bgcolor: 'grey.900',
          color: 'common.white',
          borderRadius: 2,
          display: 'flex', flexDirection: 'column',
        }}
      >
        <Box
            component="iframe"
            src={certificate.pdf}
            sx={{
                width: "100%",
                height: 180,
                border: 0,
                borderTopLeftRadius: 8, borderTopRightRadius: 8,
                backgroundColor: 'rgba(30, 30, 30, .8)'
            }}
            title={t(certificate.title)}
            allow='fullscreen'
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          </Box>
          <Typography gutterBottom variant="h5" fontWeight="bold">
            {t(certificate.title)}
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
            {t(certificate.description)}
          </Typography>
        </CardContent>
        <CardActions sx={{ p: 2, pt: 0, display: 'flex', gap: 2 }}>
            <Button 
                onClick={() => setOpenViewer(true)}
                endIcon={<ArrowForwardIcon />}
                variant="outlined"
                size="medium"
                fullWidth
                sx={{
                borderColor: 'grey.700',
                color: 'grey.700',
                fontWeight: 'bold',
                textTransform: 'none',
                py: 1.5,
                borderRadius: 2,
                '&:hover': { bgcolor: 'grey.100' }
                }}
            >
                {t("projects.btnVisualizar")}
            </Button>

            <Button
                variant="outlined"
                size="medium"
                fullWidth
                component="a"
                href={certificate.pdf}
                download
                endIcon={<Download />} 
                sx={{
                borderColor: 'grey.700',
                color: 'grey.700',
                fontWeight: 'bold',
                textTransform: 'none',
                py: 1.5,
                borderRadius: 2,
                '&:hover': { bgcolor: 'grey.100' }
                }}
            >
                {t("projects.btnBaixar")} {/* Ex: "Baixar PDF" */}
            </Button>
        </CardActions>
      </Card>

       <PdfModalViewer
        open={openViewer}
        onClose={() => setOpenViewer(false)}
        pdfUrl={certificate.pdf}
        title={certificate.title}
      />
    </>
  );
};