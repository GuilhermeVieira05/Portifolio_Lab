import React, { useEffect, useState } from "react";
import { Box, Container, Typography, Button, TextField, MenuItem, IconButton, Paper } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAdminResource } from "./hooks/useAdminResource";
import type { SkillData, SkillCategory } from "../../Types/SkillType";
import { skillIconRegistry } from "../../lib/iconRegistry";

const CATEGORIES: SkillCategory[] = ["Frontend", "Backend", "Mobile", "Database", "DevOps", "Testing", "Design", "Tools", "Outros"];

const EMPTY: SkillData = { id: "", name: "", iconName: "SiReact", category: "Frontend", color: "#000000", bg: "#EEEEEE", ariaLabel: "" };

export const SkillsAdmin: React.FC = () => {
  const { items, loading, saving, error, save } = useAdminResource<SkillData>("skills");
  const [draft, setDraft] = useState<SkillData[]>([]);

  useEffect(() => setDraft(items), [items]);

  const updateItem = (index: number, next: SkillData) => {
    setDraft((prev) => prev.map((item, i) => (i === index ? next : item)));
  };
  const removeItem = (index: number) => setDraft((prev) => prev.filter((_, i) => i !== index));
  const addItem = () => setDraft((prev) => [...prev, { ...EMPTY, id: `skill-${Date.now()}` }]);

  if (loading) return <Container sx={{ py: 4 }}>Carregando...</Container>;

  return (
    <Container sx={{ py: 4, display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h4">Skills</Typography>
      {error && <Typography color="error">{error}</Typography>}

      {draft.map((item, index) => (
        <Paper key={item.id || index} sx={{ p: 3, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
          <TextField label="Nome" value={item.name} onChange={(e) => updateItem(index, { ...item, name: e.target.value })} />
          <TextField
            select
            label="Ícone"
            value={item.iconName}
            onChange={(e) => updateItem(index, { ...item, iconName: e.target.value })}
            sx={{ minWidth: 160 }}
          >
            {Object.keys(skillIconRegistry).map((name) => (
              <MenuItem key={name} value={name}>{name}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Categoria"
            value={item.category}
            onChange={(e) => updateItem(index, { ...item, category: e.target.value as SkillCategory })}
            sx={{ minWidth: 140 }}
          >
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </TextField>
          <TextField label="Cor" value={item.color} onChange={(e) => updateItem(index, { ...item, color: e.target.value })} sx={{ width: 120 }} />
          <TextField label="Fundo" value={item.bg} onChange={(e) => updateItem(index, { ...item, bg: e.target.value })} sx={{ width: 120 }} />
          <TextField label="Aria label" value={item.ariaLabel} onChange={(e) => updateItem(index, { ...item, ariaLabel: e.target.value })} />
          <IconButton onClick={() => removeItem(index)} aria-label="remover">
            <DeleteIcon />
          </IconButton>
        </Paper>
      ))}

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="outlined" onClick={addItem}>Adicionar skill</Button>
        <Button variant="contained" disabled={saving} onClick={() => save(draft)}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </Box>
    </Container>
  );
};
