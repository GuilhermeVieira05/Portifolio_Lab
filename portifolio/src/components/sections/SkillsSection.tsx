import React, { useMemo, useState } from "react";
import { Box, Container, Button } from "@mui/material";
import { TechSkills } from "../../components/TechSkills";
import skillsJson from "../../data/json/skills.json";
import type { SkillData } from "../../Types/SkillType";
import { resolveSkillIcon } from "../../lib/iconRegistry";
import type { OrderedCategory, TechItem } from "../../Types/techItem";
import { Title } from "../Title";
import { useTranslation } from "react-i18next";

const ORDERED_CATEGORIES: readonly OrderedCategory[] = [
  "habilidadesSecao.filtros.todos",
  "habilidadesSecao.filtros.frontend",
  "habilidadesSecao.filtros.backend",
  "habilidadesSecao.filtros.mobile",
  "habilidadesSecao.filtros.database",
  "habilidadesSecao.filtros.devops",
  "habilidadesSecao.filtros.testing",
  "habilidadesSecao.filtros.design",
  "habilidadesSecao.filtros.tools",
  "habilidadesSecao.filtros.outros",
] as const;

type FilterType = (typeof ORDERED_CATEGORIES)[number];

function normalizeCategory(raw?: string): FilterType | undefined {
  if (!raw) return "habilidadesSecao.filtros.outros";
  const s = raw.trim().toLowerCase();

  if (s === "frontend") return "habilidadesSecao.filtros.frontend";
  if (s === "backend") return "habilidadesSecao.filtros.backend";
  if (s === "mobile") return "habilidadesSecao.filtros.mobile";
  if (s === "database" || s === "db") return "habilidadesSecao.filtros.database";
  if (s === "devops") return "habilidadesSecao.filtros.devops";
  if (s === "testing" || s === "tests") return "habilidadesSecao.filtros.testing";
  if (s === "design" || s === "ui" || s === "ux") return "habilidadesSecao.filtros.design";
  if (s === "tools" || s === "tooling") return "habilidadesSecao.filtros.tools";
  if (s === "outros" || s === "others" || s === "misc") return "habilidadesSecao.filtros.outros";
  if (s === "all" || s === "todos") return "habilidadesSecao.filtros.todos";
  return "habilidadesSecao.filtros.outros";
}

export const SkillsSection: React.FC = () => {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<FilterType>("habilidadesSecao.filtros.todos");

  const normalizedItems: TechItem[] = useMemo(() => {
    const skills = skillsJson as SkillData[];
    return skills.map((s) => ({
      name: s.name,
      icon: resolveSkillIcon(s.iconName),
      color: s.color,
      bg: s.bg,
      ariaLabel: s.ariaLabel,
      category: normalizeCategory(s.category) ?? "Outros",
    }));
  }, []);

  const filteredItems = useMemo(() => {
    if (filter === "habilidadesSecao.filtros.todos") return normalizedItems;
    return normalizedItems.filter((s) => s.category === filter);
  }, [filter, normalizedItems]);

  return (
    <Box component="section" id="skills" sx={{ pt: { xs: 4, md: 4 }, pb: { xs: 4, md: 10 }, bgcolor: '#2a2a2a' }}>
      <Container maxWidth="lg" sx={{justifyContent: "center", display: "flex", flexDirection: "column"}}>
        <Title title={t("habilidadesSecao.titulo")} subtitle={t("habilidadesSecao.subtitulo")}></Title>

        {/* Filtros estilo pill, fundo paper e borda destacando o selecionado */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 1,
            mb: 4,
          }}
        >
          {ORDERED_CATEGORIES.map((cat) => {
            const selected = filter === cat;
            return (
              <Button
                key={cat}
                onClick={() => setFilter(cat)}
                aria-pressed={selected}
                sx={{
                  borderRadius: 9999,
                  textTransform: "none",
                  px: { xs: 1, sm: 3 },
                  py: 1,
                  fontWeight: 600,
                  fontSize: { xs: "12px", sm: "14px" },
                  border: "2px solid",
                  borderColor: "#f5f5f5",
                  color: selected ? "primary.contrastText" : "text.primary",
                  bgcolor: selected ? "#2c2c2c" : "background.paper",
                  "&:hover": {
                    color: '#f5f5f5',
                    bgcolor: selected ? "#1e1e1e" : "action.hover",
                    borderColor: "#f5f5f5 ",
                  },
                }}
              >
                {t(cat)}
              </Button>
            );
          })}
        </Box>

        <TechSkills
          items={filteredItems}
          gap={2}
          iconSize={48}
          iconBoxHeight={72}
          iconBoxWidth={72}
          rounded={2}
          elevation={1}
          showTooltip
        />
      </Container>
    </Box>
  );
};