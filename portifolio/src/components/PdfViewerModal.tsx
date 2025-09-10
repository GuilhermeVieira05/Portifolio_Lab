// PdfModalViewer.jsx
import { useState } from 'react';
import { Modal, Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export default function PdfModalViewer({ open, onClose, pdfUrl, title }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const goPrev = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const goNext = () => setPageNumber((prev) => Math.min(prev + 1, numPages));

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95vw', sm: '80vw', md: '60vw' },
          height: { xs: '95vh', sm: '80vh', md: '80vh' },
          bgcolor: 'background.paper', boxShadow: 24, p: 2, borderRadius: 2,
          display: 'flex', flexDirection: 'column', outline: 'none'
        }}
      >
        {/* Cabeçalho */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {title || 'Visualizador PDF'}
          </Typography>
          <IconButton aria-label="close" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Corpo do PDF */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto',
            bgcolor: '#eee',
            borderRadius: 1,
            py: 1
          }}
        >
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<Typography>Carregando PDF...</Typography>}
            error={<Typography color="error">Erro ao carregar o PDF.</Typography>}
          >
            <Page
              pageNumber={pageNumber}
              width={Math.min(window.innerWidth * 0.9, 700)}
            />
          </Document>
        </Box>

        {/* Navegação de páginas */}
        {numPages && numPages > 1 && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
            <IconButton onClick={goPrev} disabled={pageNumber <= 1}>
              <ArrowBackIcon />
            </IconButton>
            <Typography sx={{ mx: 2 }}>
              Página {pageNumber} de {numPages}
            </Typography>
            <IconButton onClick={goNext} disabled={pageNumber >= numPages}>
              <ArrowForwardIcon />
            </IconButton>
          </Box>
        )}
      </Box>
    </Modal>
  );
}