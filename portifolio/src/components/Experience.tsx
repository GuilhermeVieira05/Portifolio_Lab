import React, { useRef } from 'react';

import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useMediaQuery, useTheme } from '@mui/material';

import SchoolIcon from '@mui/icons-material/School';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import HandshakeIcon from '@mui/icons-material/Handshake';

import { keyframes } from '@mui/system';
import {
  motion,
  type Variants,
  useMotionValue,
  useSpring,
  useInView
} from 'framer-motion';

import experiencesJson from '../data/json/experiences.json';
import { localize } from '../lib/localized';
import i18n from '../i18n';
import { type ExperienceType } from "../Types/ExperienceType.js";

const growY = keyframes`
  0% { transform: scaleY(0); }
  100% { transform: scaleY(1); }
`;
const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.35); }
  50% { box-shadow: 0 0 0 10px rgba(33,150,243,0); }
`;

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 32, filter: 'blur(6px)' },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  })
};

const MotionBox = motion(Box);

type TiltCardProps = {
  children: React.ReactNode;
  maxTilt?: number;
  hoverScale?: number;
  isDisabled?: boolean;
  sx?: any;
  initialDelay?: number;
  entrance?: boolean;
};

const TiltCard: React.FC<TiltCardProps> = ({
  children,
  maxTilt = 8,
  hoverScale = 1.02,
  isDisabled = false,
  sx,
  initialDelay = 0,
  entrance = true
}) => {



  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const springRx = useSpring(rx, { stiffness: 200, damping: 20, mass: 0.5 });
  const springRy = useSpring(ry, { stiffness: 200, damping: 20, mass: 0.5 });

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (isDisabled) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    ry.set((px - 0.5) * (maxTilt * 2));
    rx.set(-(py - 0.5) * (maxTilt * 2));
  };

  const handleMouseLeave = () => { rx.set(0); ry.set(0); };

  if (isDisabled) {
    return entrance ? (
      <MotionBox
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: initialDelay, duration: 0.6 }}
        sx={sx}
      >
        {children}
      </MotionBox>
    ) : (
      <Box sx={sx}>{children}</Box>
    );
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: hoverScale }}
      style={{
        perspective: 900,
        transformStyle: 'preserve-3d',
        filter: 'drop-shadow(0 12px 22px rgba(181, 193, 204, 0.28))',
        WebkitFilter: 'drop-shadow(0 12px 22px rgba(181, 193, 204, 0.28))',
        backfaceVisibility: 'hidden',
      }}
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: initialDelay, duration: 4.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        style={{
          rotateX: springRx as any,
          rotateY: springRy as any,
          willChange: 'transform',
          borderRadius: 5,
        }}
      >
        <Box
          sx={{
            background: "#2c2c2c",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            borderRadius: 5,
            overflow: "hidden",
            backgroundClip: "padding-box",
            color: "#fff",
            p: 2,
            transition: "background .25s ease, border-color .25s ease",
            "&:hover": {
              background: "linear-gradient(135deg, rgb(94, 94, 94) 0%, rgb(174, 177, 180) 100%)",
              borderColor: "rgba(255, 255, 255, 0.3)",
            },
          }}
        >
          {children}
        </Box>
      </motion.div>
    </motion.div>
  );

};

/* ===== componente principal ===== */
export const ExperienceTimeline = () => {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down('sm'));
  const dados: ExperienceType[] = experiencesJson as ExperienceType[];

  function parseMonthYearString(str?: string) {
    if (!str) return null;
    const [month, year] = str.split('/');
    return new Date(parseInt(year), parseInt(month) - 1);
  }
  function formatDate(date?: string) {
    if (!date) return '';
    const d = parseMonthYearString(date);
    if (!d) return '';
    const f = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return f.charAt(0).toUpperCase() + f.slice(1);
  }

  return (
    <div>
      <Timeline position={isSm ? 'right' : 'alternate'} sx={{ px: { xs: 0, sm: 1 }, py: 1 }}>
        {dados.map((item, idx) => {
          const ref = useRef<HTMLLIElement | null>(null);
          const inView = useInView(ref, { once: true, amount: 0.3, margin: '0px 0px -10% 0px' });

          return (
            <TimelineItem key={idx} sx={{
              gap: 1, "&::before": {
                display: isSm ? "none" : "block",
              },
            }} ref={ref}>
              <TimelineSeparator>
                <TimelineDot
                  color="primary"
                  variant={idx === 0 ? "filled" : "outlined"}
                  sx={{
                    backgroundColor: "#2c2c2c",
                    border: "3px solid #2c2c2c",
                    position: "relative",
                    '::after': {
                      content: '""',
                      position: 'absolute',
                      inset: -4,
                      borderRadius: '50%',
                      animation: `${pulse} 2.4s ease-out infinite`,
                    },
                    '& .MuiSvgIcon-root': {
                      color: "#fff",
                      filter: "drop-shadow(0 0 6px rgba(255, 255, 255, 0.4))"
                    }
                  }}
                >
                  {(localize(item.type, i18n.language) === "Trabalho" || localize(item.type, i18n.language) === "Work") && <BusinessCenterIcon fontSize="small" />}
                  {(localize(item.type, i18n.language) === "Estudo" || localize(item.type, i18n.language) === "Study") && <SchoolIcon fontSize="small" />}
                  {(localize(item.type, i18n.language) === "Voluntariado" || localize(item.type, i18n.language) === "Volunteering") && <HandshakeIcon fontSize="small" />}
                </TimelineDot>

                {idx !== dados.length - 1 && (
                  <TimelineConnector
                    sx={{
                      transformOrigin: 'top',
                      animation: `${growY} 600ms ease-out ${idx * 0.12 + 0.2}s both`,
                      backgroundColor: 'rgb(255, 255, 255)',
                      animationPlayState: inView ? 'running' : 'paused'
                    }}
                  />
                )}
              </TimelineSeparator>

              <MotionBox
                variants={itemVariants}
                custom={idx}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3, margin: '0px 0px -10% 0px' }}
                sx={{ display: 'contents' }}
              >
                <TimelineContent sx={{ px: { xs: 0, sm: 2 }, mb: { xs: 2, sm: 0 } }}>
                  <TiltCard
                    entrance={false}
                    isDisabled={isSm}
                    maxTilt={8}
                    hoverScale={1.02}
                    sx={{
                      //background: "linear-gradient(135deg, rgb(30,30,30) 0%, rgb(80,120,160) 100%)",
                      border: "1px solid rgba(255, 255, 255, 0.4)",
                      borderRadius: 3,
                      boxShadow: "0 4px 12px rgba(194, 202, 211, 0.25)",
                      minWidth: 20,
                      color: "#fff",
                      p: 2,
                      transition: "background .25s ease, border-color .25s ease",
                      "&:hover": {
                        //background: "linear-gradient(135deg, rgb(12,35,70) 0%, rgb(45,100,150) 100%)",
                        borderColor: "rgba(255, 255, 255, 0.3)",
                      }
                    }}
                  >
                    <Typography variant="h6" component="span" fontWeight={700} sx={{ color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}>
                      {localize(item.role, i18n.language)}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: "rgba(255,255,255,0.75)" }}>
                      {localize(item.company, i18n.language)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}>
                      {formatDate(item.startDate)} — {item.finalDate ? formatDate(item.finalDate) : "Atual"}
                    </Typography>
                    <Typography variant="body2" mt={1} sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
                      {localize(item.description, i18n.language)}
                    </Typography>
                    <Box
                      mt={1}
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                        px: 1.2,
                        py: 0.4,
                        borderRadius: 1.5,
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#fff",
                        backgroundColor: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.25)",
                        letterSpacing: 0.3
                      }}
                    >
                      {(localize(item.type, i18n.language) === "Trabalho" || localize(item.type, i18n.language) === "Work") && <BusinessCenterIcon fontSize="inherit" />}
                      {(localize(item.type, i18n.language) === "Estudo" || localize(item.type, i18n.language) === "Study") && <SchoolIcon fontSize="inherit" />}
                      {(localize(item.type, i18n.language) === "Voluntariado" || localize(item.type, i18n.language) === "Volunteering") && <HandshakeIcon fontSize="inherit" />}
                      {localize(item.type, i18n.language)}
                    </Box>
                  </TiltCard>
                </TimelineContent>
              </MotionBox>
            </TimelineItem>
          );
        })}
      </Timeline>
    </div>
  );
};
