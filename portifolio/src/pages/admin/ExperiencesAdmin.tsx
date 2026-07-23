import React, { useState } from "react";
import { Box, Container, Typography, Button, TextField, IconButton, Paper } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAdminResource } from "./hooks/useAdminResource";
import { LocalizedTextField } from "./components/LocalizedTextField";
import type { ExperienceType } from "../../Types/ExperienceType";

const EMPTY: ExperienceType = {
  id: "",
  role: { pt: "", en: "" },
  company: { pt: "", en: "" },
  startDate: "",
  finalDate: null,
  description: { pt: "", en: "" },
  type: { pt: "Trabalho", en: "Work" },
};

export const ExperiencesAdmin: React.FC = () => {
  const { items, loading, saving, error, save } = useAdminResource<ExperienceType>("experiences");
  const [draft, setDraft] = useState<ExperienceType[]>([]);

  React.useEffect(() => {
    setDraft(items);
  }, [items]);

  const updateItem = (index: number, next: ExperienceType) => {
    setDraft((prev) => prev.map((item, i) => (i === index ? next : item)));
  };

  const removeItem = (index: number) => {
    setDraft((prev) => prev.filter((_, i) => i !== index));
  };

  const addItem = () => {
    setDraft((prev) => [...prev, { ...EMPTY, id: `exp-${Date.now()}` }]);
  };

  if (loading) return <Container sx={{ py: 4 }}>Carregando...</Container>;

  return (
    <Container sx={{ py: 4, display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h4">Experiências</Typography>
      {error && <Typography color="error">{error}</Typography>}

      {draft.map((item, index) => (
        <Paper key={item.id || index} sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="subtitle1">{item.id || "(novo)"}</Typography>
            <IconButton onClick={() => removeItem(index)} aria-label="remover">
              <DeleteIcon />
            </IconButton>
          </Box>
          <LocalizedTextField label="Cargo" value={item.role} onChange={(v) => updateItem(index, { ...item, role: v })} />
          <LocalizedTextField label="Empresa" value={item.company} onChange={(v) => updateItem(index, { ...item, company: v })} />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Início (MM/AAAA)"
              value={item.startDate}
              onChange={(e) => updateItem(index, { ...item, startDate: e.target.value })}
            />
            <TextField
              label="Fim (MM/AAAA, vazio = atual)"
              value={item.finalDate ?? ""}
              onChange={(e) => updateItem(index, { ...item, finalDate: e.target.value || null })}
            />
          </Box>
          <LocalizedTextField
            label="Descrição"
            value={item.description}
            onChange={(v) => updateItem(index, { ...item, description: v })}
            multiline
          />
          <LocalizedTextField
            label="Tipo (Trabalho/Estudo/Voluntariado)"
            value={item.type}
            onChange={(v) => updateItem(index, { ...item, type: v })}
          />
        </Paper>
      ))}

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="outlined" onClick={addItem}>Adicionar experiência</Button>
        <Button variant="contained" disabled={saving} onClick={() => save(draft)}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </Box>
    </Container>
  );
};
