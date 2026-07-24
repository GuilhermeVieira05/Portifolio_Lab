import React, { useEffect, useState } from "react";
import { Box, Typography, Button, TextField, MenuItem, IconButton, Paper, Chip, Alert, Divider } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useAdminResource } from "./hooks/useAdminResource";
import { useSaveFeedback } from "./hooks/useSaveFeedback";
import { AdminLayout } from "./AdminLayout";
import { LocalizedTextField } from "./components/LocalizedTextField";
import { uploadProjectMedia, AdminApiError } from "../../api/adminApi";
import type { CardType } from "../../Types/cardType";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

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
  const { justSaved, notifySaved } = useSaveFeedback();
  const [draft, setDraft] = useState<CardType[]>([]);
  const [mediaStatus, setMediaStatus] = useState<Record<number, string>>({});

  useEffect(() => setDraft(items), [items]);

  const updateItem = (index: number, next: CardType) => {
    setDraft((prev) => prev.map((item, i) => (i === index ? next : item)));
  };
  const removeItem = (index: number) => setDraft((prev) => prev.filter((_, i) => i !== index));
  const addItem = () => setDraft((prev) => [...prev, { ...EMPTY, id: `proj-${Date.now()}` }]);

  const handleSave = async () => {
    try {
      await save(draft);
      notifySaved();
    } catch {
      // error state is already set by useAdminResource
    }
  };

  const handleMediaUpload = async (
    index: number,
    kind: "image" | "video",
    file: File
  ) => {
    setMediaStatus((prev) => ({ ...prev, [index]: "Enviando..." }));
    try {
      const base64 = await fileToBase64(file);
      const ext = file.name.split(".").pop() ?? "";
      const projectId = draft[index].id || `proj-${Date.now()}`;
      const filename = `${slugify(projectId)}.${ext}`;
      const { url } = await uploadProjectMedia(base64, filename, kind);
      updateItem(index, { ...draft[index], [kind]: url });
      setMediaStatus((prev) => ({ ...prev, [index]: "Enviado." }));
    } catch (err) {
      setMediaStatus((prev) => ({
        ...prev,
        [index]: err instanceof AdminApiError ? err.message : "Erro ao enviar arquivo",
      }));
    }
  };

  return (
    <AdminLayout title="Projetos">
      {loading ? (
        <Typography color="text.secondary">Carregando...</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {justSaved && <Alert severity="success">Alterações salvas.</Alert>}

          {draft.length === 0 && (
            <Typography color="text.secondary">Nenhum projeto cadastrado ainda.</Typography>
          )}

          {draft.map((item, index) => (
            <Paper key={item.id || index} sx={{ p: 3, border: "1px solid rgba(255,255,255,0.08)" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Projeto {index + 1}
                </Typography>
                <IconButton onClick={() => removeItem(index)} aria-label="remover projeto" color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <LocalizedTextField label="Título" value={item.title} onChange={(v) => updateItem(index, { ...item, title: v })} />
                <LocalizedTextField label="Descrição" value={item.description} onChange={(v) => updateItem(index, { ...item, description: v })} multiline />

                <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                  <TextField
                    select
                    label="Tipo"
                    value={item.type}
                    onChange={(e) => updateItem(index, { ...item, type: e.target.value })}
                    sx={{ minWidth: 200 }}
                  >
                    {TYPES.map((t) => (
                      <MenuItem key={t} value={t}>{t}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Data (DD/MM/AAAA)"
                    value={item.date}
                    onChange={(e) => updateItem(index, { ...item, date: e.target.value })}
                    sx={{ minWidth: 180 }}
                  />
                </Box>

                <LocalizedTextField label="Status" value={item.status} onChange={(v) => updateItem(index, { ...item, status: v })} />

                <TextField
                  label="Tecnologias (separadas por vírgula)"
                  value={item.languages.join(", ")}
                  onChange={(e) => updateItem(index, { ...item, languages: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                  fullWidth
                />
                {item.languages.length > 0 && (
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {item.languages.map((lang) => (
                      <Chip key={lang} label={lang} size="small" />
                    ))}
                  </Box>
                )}

                <TextField
                  label="Link do site (opcional)"
                  value={item.siteLink ?? ""}
                  onChange={(e) => updateItem(index, { ...item, siteLink: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Link do GitHub (opcional)"
                  value={item.gitHubLink ?? ""}
                  onChange={(e) => updateItem(index, { ...item, gitHubLink: e.target.value })}
                  fullWidth
                />
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Imagem de capa</Typography>
                  {item.image && (
                    <Box
                      component="img"
                      src={item.image}
                      alt=""
                      sx={{ maxWidth: 240, maxHeight: 140, objectFit: "cover", borderRadius: 1, border: "1px solid rgba(255,255,255,0.08)" }}
                    />
                  )}
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                    <Button variant="outlined" component="label" size="small" startIcon={<UploadFileIcon />}>
                      Enviar imagem
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/gif,image/webp"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleMediaUpload(index, "image", file);
                        }}
                      />
                    </Button>
                    <TextField
                      label="ou caminho manual"
                      value={item.image ?? ""}
                      onChange={(e) => updateItem(index, { ...item, image: e.target.value })}
                      size="small"
                      sx={{ minWidth: 220 }}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Vídeo (opcional)</Typography>
                  {item.video && (
                    <Box
                      component="video"
                      src={item.video}
                      controls
                      sx={{ maxWidth: 240, maxHeight: 140, borderRadius: 1, border: "1px solid rgba(255,255,255,0.08)" }}
                    />
                  )}
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                    <Button variant="outlined" component="label" size="small" startIcon={<UploadFileIcon />}>
                      Enviar vídeo
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleMediaUpload(index, "video", file);
                        }}
                      />
                    </Button>
                    <TextField
                      label="ou caminho manual"
                      value={item.video ?? ""}
                      onChange={(e) => updateItem(index, { ...item, video: e.target.value })}
                      size="small"
                      sx={{ minWidth: 220 }}
                    />
                  </Box>
                </Box>

                {mediaStatus[index] && (
                  <Typography variant="body2" color="text.secondary">
                    {mediaStatus[index]}
                  </Typography>
                )}
              </Box>
            </Paper>
          ))}

          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={addItem}>
              Adicionar projeto
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
