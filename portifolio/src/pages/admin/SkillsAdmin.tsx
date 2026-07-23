import React, { useEffect, useState } from "react";
import { Box, Typography, Button, TextField, MenuItem, IconButton, Paper, Alert, Divider, Avatar } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import { useAdminResource } from "./hooks/useAdminResource";
import { useSaveFeedback } from "./hooks/useSaveFeedback";
import { AdminLayout } from "./AdminLayout";
import type { SkillData, SkillCategory } from "../../Types/SkillType";
import { skillIconRegistry } from "../../lib/iconRegistry";

const CATEGORIES: SkillCategory[] = ["Frontend", "Backend", "Mobile", "Database", "DevOps", "Testing", "Design", "Tools", "Outros"];

const EMPTY: SkillData = { id: "", name: "", iconName: "SiReact", category: "Frontend", color: "#36BCF7", bg: "#0B2C3C", ariaLabel: "" };

export const SkillsAdmin: React.FC = () => {
  const { items, loading, saving, error, save } = useAdminResource<SkillData>("skills");
  const { justSaved, notifySaved } = useSaveFeedback();
  const [draft, setDraft] = useState<SkillData[]>([]);

  useEffect(() => setDraft(items), [items]);

  const updateItem = (index: number, next: SkillData) => {
    setDraft((prev) => prev.map((item, i) => (i === index ? next : item)));
  };
  const removeItem = (index: number) => setDraft((prev) => prev.filter((_, i) => i !== index));
  const addItem = () => setDraft((prev) => [...prev, { ...EMPTY, id: `skill-${Date.now()}` }]);

  const handleSave = async () => {
    try {
      await save(draft);
      notifySaved();
    } catch {
      // error state is already set by useAdminResource
    }
  };

  return (
    <AdminLayout title="Skills">
      {loading ? (
        <Typography color="text.secondary">Carregando...</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {justSaved && <Alert severity="success">Alterações salvas.</Alert>}

          {draft.length === 0 && (
            <Typography color="text.secondary">Nenhuma skill cadastrada ainda.</Typography>
          )}

          {draft.map((item, index) => {
            const Icon = skillIconRegistry[item.iconName];
            return (
              <Paper
                key={item.id || index}
                sx={{ p: 2.5, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <Avatar sx={{ bgcolor: item.bg, width: 44, height: 44, color: item.color }}>
                  {Icon && <Icon />}
                </Avatar>

                <TextField label="Nome" value={item.name} onChange={(e) => updateItem(index, { ...item, name: e.target.value })} sx={{ minWidth: 160 }} />

                <TextField
                  select
                  label="Ícone"
                  value={item.iconName}
                  onChange={(e) => updateItem(index, { ...item, iconName: e.target.value })}
                  sx={{ minWidth: 170 }}
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
                  sx={{ minWidth: 150 }}
                >
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Cor"
                  type="color"
                  value={item.color}
                  onChange={(e) => updateItem(index, { ...item, color: e.target.value })}
                  sx={{ width: 70 }}
                />
                <TextField
                  label="Fundo"
                  type="color"
                  value={item.bg.length === 7 ? item.bg : "#000000"}
                  onChange={(e) => updateItem(index, { ...item, bg: e.target.value })}
                  sx={{ width: 70 }}
                />

                <TextField
                  label="Aria label"
                  value={item.ariaLabel}
                  onChange={(e) => updateItem(index, { ...item, ariaLabel: e.target.value })}
                  sx={{ minWidth: 140 }}
                />

                <IconButton onClick={() => removeItem(index)} aria-label="remover skill" color="error" sx={{ ml: "auto" }}>
                  <DeleteIcon />
                </IconButton>
              </Paper>
            );
          })}

          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={addItem}>
              Adicionar skill
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
