import React, { useEffect, useState } from "react";
import { Box, Typography, Button, TextField, MenuItem, IconButton, Paper, Alert, Divider, Avatar } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import { useAdminResource } from "./hooks/useAdminResource";
import { useSaveFeedback } from "./hooks/useSaveFeedback";
import { AdminLayout } from "./AdminLayout";
import { LocalizedTextField } from "./components/LocalizedTextField";
import type { ServiceItem } from "../../Types/ServiceType";
import { serviceIconRegistry } from "../../lib/iconRegistry";

const EMPTY: ServiceItem = { iconName: "Language", title: { pt: "", en: "" }, description: { pt: "", en: "" } };

export const ServicesAdmin: React.FC = () => {
  const { items, loading, saving, error, save } = useAdminResource<ServiceItem>("services");
  const { justSaved, notifySaved } = useSaveFeedback();
  const [draft, setDraft] = useState<ServiceItem[]>([]);

  useEffect(() => setDraft(items), [items]);

  const updateItem = (index: number, next: ServiceItem) => {
    setDraft((prev) => prev.map((item, i) => (i === index ? next : item)));
  };
  const removeItem = (index: number) => setDraft((prev) => prev.filter((_, i) => i !== index));
  const addItem = () => setDraft((prev) => [...prev, { ...EMPTY }]);

  const handleSave = async () => {
    try {
      await save(draft);
      notifySaved();
    } catch {
      // error state is already set by useAdminResource
    }
  };

  return (
    <AdminLayout title="Serviços">
      {loading ? (
        <Typography color="text.secondary">Carregando...</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {justSaved && <Alert severity="success">Alterações salvas.</Alert>}

          {draft.length === 0 && (
            <Typography color="text.secondary">Nenhum serviço cadastrado ainda.</Typography>
          )}

          {draft.map((item, index) => {
            const Icon = serviceIconRegistry[item.iconName];
            return (
              <Paper key={index} sx={{ p: 3, border: "1px solid rgba(255,255,255,0.08)" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.main", color: "#0b0b0d" }}>
                      {Icon && <Icon />}
                    </Avatar>
                    <TextField
                      select
                      label="Ícone"
                      value={item.iconName}
                      onChange={(e) => updateItem(index, { ...item, iconName: e.target.value })}
                      sx={{ minWidth: 200 }}
                    >
                      {Object.keys(serviceIconRegistry).map((name) => (
                        <MenuItem key={name} value={name}>{name}</MenuItem>
                      ))}
                    </TextField>
                  </Box>
                  <IconButton onClick={() => removeItem(index)} aria-label="remover serviço" color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <LocalizedTextField label="Título" value={item.title} onChange={(v) => updateItem(index, { ...item, title: v })} />
                  <LocalizedTextField label="Descrição" value={item.description} onChange={(v) => updateItem(index, { ...item, description: v })} multiline />
                </Box>
              </Paper>
            );
          })}

          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={addItem}>
              Adicionar serviço
            </Button>
            <Button variant="contained" startIcon={<SaveIcon />} disabled={saving} onClick={handleSave}>
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </Box>
        </Box>
      )}
    </AdminLayout>
  );
};
