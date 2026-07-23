import React, { useEffect, useState } from "react";
import { Box, Container, Typography, Button, TextField, IconButton, Paper } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAdminResource } from "./hooks/useAdminResource";
import { LocalizedTextField } from "./components/LocalizedTextField";
import type { ServiceItem } from "../../Types/ServiceType";
import { serviceIconRegistry } from "../../lib/iconRegistry";

const EMPTY: ServiceItem = { iconName: "Language", title: { pt: "", en: "" }, description: { pt: "", en: "" } };

export const ServicesAdmin: React.FC = () => {
  const { items, loading, saving, error, save } = useAdminResource<ServiceItem>("services");
  const [draft, setDraft] = useState<ServiceItem[]>([]);

  useEffect(() => setDraft(items), [items]);

  const updateItem = (index: number, next: ServiceItem) => {
    setDraft((prev) => prev.map((item, i) => (i === index ? next : item)));
  };
  const removeItem = (index: number) => setDraft((prev) => prev.filter((_, i) => i !== index));
  const addItem = () => setDraft((prev) => [...prev, { ...EMPTY }]);

  if (loading) return <Container sx={{ py: 4 }}>Carregando...</Container>;

  return (
    <Container sx={{ py: 4, display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h4">Serviços</Typography>
      {error && <Typography color="error">{error}</Typography>}

      {draft.map((item, index) => (
        <Paper key={index} sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <TextField
              select
              label="Ícone"
              value={item.iconName}
              onChange={(e) => updateItem(index, { ...item, iconName: e.target.value })}
              SelectProps={{ native: true }}
              sx={{ minWidth: 200 }}
            >
              {Object.keys(serviceIconRegistry).map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </TextField>
            <IconButton onClick={() => removeItem(index)} aria-label="remover">
              <DeleteIcon />
            </IconButton>
          </Box>
          <LocalizedTextField label="Título" value={item.title} onChange={(v) => updateItem(index, { ...item, title: v })} />
          <LocalizedTextField label="Descrição" value={item.description} onChange={(v) => updateItem(index, { ...item, description: v })} multiline />
        </Paper>
      ))}

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="outlined" onClick={addItem}>Adicionar serviço</Button>
        <Button variant="contained" disabled={saving} onClick={() => save(draft)}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </Box>
    </Container>
  );
};
