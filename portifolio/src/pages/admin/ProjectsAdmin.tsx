import React, { useEffect, useState } from "react";
import { Box, Container, Typography, Button, TextField, MenuItem, IconButton, Paper, Chip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAdminResource } from "./hooks/useAdminResource";
import { LocalizedTextField } from "./components/LocalizedTextField";
import type { CardType } from "../../Types/cardType";

const TYPES = ["Sites", "Landing Pages", "Aplicativos", "E-Commerce", "Outros"];

const EMPTY: CardType = {
  id: "",
  title: { pt: "", en: "" },
  description: { pt: "", en: "" },
  languages: [],
  type: "Sites",
  status: { pt: "Concluído", en: "Done" },
  date: "",
};

export const ProjectsAdmin: React.FC = () => {
  const { items, loading, saving, error, save } = useAdminResource<CardType>("projects");
  const [draft, setDraft] = useState<CardType[]>([]);

  useEffect(() => setDraft(items), [items]);

  const updateItem = (index: number, next: CardType) => {
    setDraft((prev) => prev.map((item, i) => (i === index ? next : item)));
  };
  const removeItem = (index: number) => setDraft((prev) => prev.filter((_, i) => i !== index));
  const addItem = () => setDraft((prev) => [...prev, { ...EMPTY, id: `proj-${Date.now()}` }]);

  if (loading) return <Container sx={{ py: 4 }}>Carregando...</Container>;

  return (
    <Container sx={{ py: 4, display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h4">Projetos</Typography>
      {error && <Typography color="error">{error}</Typography>}

      {draft.map((item, index) => (
        <Paper key={item.id || index} sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="subtitle1">{item.id || "(novo)"}</Typography>
            <IconButton onClick={() => removeItem(index)} aria-label="remover">
              <DeleteIcon />
            </IconButton>
          </Box>
          <LocalizedTextField label="Título" value={item.title} onChange={(v) => updateItem(index, { ...item, title: v })} />
          <LocalizedTextField label="Descrição" value={item.description} onChange={(v) => updateItem(index, { ...item, description: v })} multiline />
          <TextField
            select
            label="Tipo"
            value={item.type}
            onChange={(e) => updateItem(index, { ...item, type: e.target.value })}
            sx={{ maxWidth: 240 }}
          >
            {TYPES.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </TextField>
          <LocalizedTextField label="Status" value={item.status} onChange={(v) => updateItem(index, { ...item, status: v })} />
          <TextField
            label="Tecnologias (separadas por vírgula)"
            value={item.languages.join(", ")}
            onChange={(e) => updateItem(index, { ...item, languages: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
          />
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {item.languages.map((lang) => (
              <Chip key={lang} label={lang} size="small" />
            ))}
          </Box>
          <TextField label="Data (DD/MM/AAAA)" value={item.date} onChange={(e) => updateItem(index, { ...item, date: e.target.value })} sx={{ maxWidth: 200 }} />
          <TextField label="Link do site" value={item.siteLink ?? ""} onChange={(e) => updateItem(index, { ...item, siteLink: e.target.value })} />
          <TextField label="Link do GitHub" value={item.gitHubLink ?? ""} onChange={(e) => updateItem(index, { ...item, gitHubLink: e.target.value })} />
          <TextField
            label="Caminho da imagem (asset existente)"
            value={item.image ?? ""}
            onChange={(e) => updateItem(index, { ...item, image: e.target.value })}
          />
          <TextField
            label="Caminho do vídeo (asset existente)"
            value={item.video ?? ""}
            onChange={(e) => updateItem(index, { ...item, video: e.target.value })}
          />
        </Paper>
      ))}

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="outlined" onClick={addItem}>Adicionar projeto</Button>
        <Button variant="contained" disabled={saving} onClick={() => save(draft)}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </Box>
    </Container>
  );
};
