import React, { useEffect, useState } from "react";
import { Box, Typography, Button, TextField, Paper, Alert, Divider } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { fetchUser, saveUser, uploadResume, AdminApiError } from "../../api/adminApi";
import { AdminLayout } from "./AdminLayout";
import { LocalizedTextField } from "./components/LocalizedTextField";
import { useSaveFeedback } from "./hooks/useSaveFeedback";
import type { User } from "../../Types/userType";
import type { LocalizedText } from "../../Types/LocalizedText";

type EditableUser = Omit<User, "img" | "curriculo">;

const EMPTY: EditableUser = {
  name: "",
  desc: { pt: "", en: "" },
  emailName: "",
  linkedinName: "",
  githubName: "",
  links: {},
  telefone: "",
  caracteristicas: [],
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const UserAdmin: React.FC = () => {
  const [user, setUser] = useState<EditableUser>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeStatus, setResumeStatus] = useState<string | null>(null);
  const { justSaved, notifySaved } = useSaveFeedback();

  useEffect(() => {
    fetchUser<EditableUser>()
      .then((data) => data && setUser(data))
      .catch((err) => setError(err instanceof AdminApiError ? err.message : "Erro ao carregar"))
      .finally(() => setLoading(false));
  }, []);

  const updateCaracteristica = (index: number, next: LocalizedText) => {
    setUser((prev) => ({
      ...prev,
      caracteristicas: prev.caracteristicas.map((c, i) => (i === index ? next : c)),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveUser(user);
      notifySaved();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeStatus("Enviando...");
    try {
      const base64 = await fileToBase64(file);
      await uploadResume(base64);
      setResumeStatus("Currículo atualizado com sucesso.");
    } catch (err) {
      setResumeStatus(err instanceof AdminApiError ? err.message : "Erro ao enviar currículo");
    }
  };

  return (
    <AdminLayout title="Dados pessoais">
      {loading ? (
        <Typography color="text.secondary">Carregando...</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {justSaved && <Alert severity="success">Alterações salvas.</Alert>}

          <Paper sx={{ p: 3, border: "1px solid rgba(255,255,255,0.08)" }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Informações básicas
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField label="Nome" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} fullWidth />
              <LocalizedTextField label="Descrição (bio)" value={user.desc} onChange={(v) => setUser({ ...user, desc: v })} multiline />
              <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                <TextField label="Email" value={user.emailName} onChange={(e) => setUser({ ...user, emailName: e.target.value })} fullWidth />
                <TextField label="Telefone" value={user.telefone} onChange={(e) => setUser({ ...user, telefone: e.target.value })} fullWidth />
              </Box>
              <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                <TextField label="Usuário do LinkedIn" value={user.linkedinName} onChange={(e) => setUser({ ...user, linkedinName: e.target.value })} fullWidth />
                <TextField label="Usuário do GitHub" value={user.githubName} onChange={(e) => setUser({ ...user, githubName: e.target.value })} fullWidth />
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 3, border: "1px solid rgba(255,255,255,0.08)" }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
              Características
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Palavras que aparecem animadas na tela inicial (ex: "Fullstack", "Backend")
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {user.caracteristicas.map((c, i) => (
                <LocalizedTextField key={i} label={`Característica ${i + 1}`} value={c} onChange={(v) => updateCaracteristica(i, v)} />
              ))}
            </Box>
          </Paper>

          <Paper sx={{ p: 3, border: "1px solid rgba(255,255,255,0.08)" }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Currículo (PDF)
            </Typography>
            <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
              Enviar novo currículo
              <input type="file" accept="application/pdf" hidden onChange={handleResumeUpload} />
            </Button>
            {resumeStatus && (
              <Typography variant="body2" sx={{ mt: 1.5 }} color="text.secondary">
                {resumeStatus}
              </Typography>
            )}
          </Paper>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

          <Box>
            <Button variant="contained" startIcon={<SaveIcon />} disabled={saving} onClick={handleSave}>
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </Box>
        </Box>
      )}
    </AdminLayout>
  );
};
