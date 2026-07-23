import React, { useState } from "react";
import { Box, Typography, Button, TextField, IconButton, Paper, Alert, Divider, Chip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import { useAdminResource } from "./hooks/useAdminResource";
import { useSaveFeedback } from "./hooks/useSaveFeedback";
import { AdminLayout } from "./AdminLayout";
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
  const { justSaved, notifySaved } = useSaveFeedback();
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

  const handleSave = async () => {
    try {
      await save(draft);
      notifySaved();
    } catch {
      // error state is already set by useAdminResource
    }
  };

  return (
    <AdminLayout title="Experiências">
      {loading ? (
        <Typography color="text.secondary">Carregando...</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {justSaved && <Alert severity="success">Alterações salvas.</Alert>}

          {draft.length === 0 && (
            <Typography color="text.secondary">Nenhuma experiência cadastrada ainda.</Typography>
          )}

          {draft.map((item, index) => (
            <Paper key={item.id || index} sx={{ p: 3, border: "1px solid rgba(255,255,255,0.08)" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Experiência {index + 1}
                  </Typography>
                  {item.startDate && (
                    <Chip
                      size="small"
                      label={`${item.startDate} — ${item.finalDate ?? "atual"}`}
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </Box>
                <IconButton onClick={() => removeItem(index)} aria-label="remover experiência" color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <LocalizedTextField label="Cargo" value={item.role} onChange={(v) => updateItem(index, { ...item, role: v })} />
                <LocalizedTextField label="Empresa" value={item.company} onChange={(v) => updateItem(index, { ...item, company: v })} />

                <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                  <TextField
                    label="Início (MM/AAAA)"
                    value={item.startDate}
                    onChange={(e) => updateItem(index, { ...item, startDate: e.target.value })}
                    helperText="Ex: 01/2025"
                    fullWidth
                  />
                  <TextField
                    label="Fim (MM/AAAA)"
                    value={item.finalDate ?? ""}
                    onChange={(e) => updateItem(index, { ...item, finalDate: e.target.value || null })}
                    helperText="Deixe em branco se for o emprego atual"
                    fullWidth
                  />
                </Box>

                <LocalizedTextField
                  label="Descrição"
                  value={item.description}
                  onChange={(v) => updateItem(index, { ...item, description: v })}
                  multiline
                />
                <LocalizedTextField
                  label="Tipo (Trabalho / Estudo / Voluntariado)"
                  value={item.type}
                  onChange={(v) => updateItem(index, { ...item, type: v })}
                />
              </Box>
            </Paper>
          ))}

          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={addItem}>
              Adicionar experiência
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
