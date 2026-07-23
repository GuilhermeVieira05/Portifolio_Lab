import React, { useEffect, useState } from "react";
import { Box, Container, Typography, Button, TextField, Input } from "@mui/material";
import { fetchUser, saveUser, uploadResume, AdminApiError } from "../../api/adminApi";
import { LocalizedTextField } from "./components/LocalizedTextField";
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
      setResumeStatus("Currículo atualizado.");
    } catch (err) {
      setResumeStatus(err instanceof AdminApiError ? err.message : "Erro ao enviar currículo");
    }
  };

  if (loading) return <Container sx={{ py: 4 }}>Carregando...</Container>;

  return (
    <Container sx={{ py: 4, display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h4">Dados pessoais</Typography>
      {error && <Typography color="error">{error}</Typography>}

      <TextField label="Nome" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
      <LocalizedTextField label="Descrição" value={user.desc} onChange={(v) => setUser({ ...user, desc: v })} multiline />
      <TextField label="Email" value={user.emailName} onChange={(e) => setUser({ ...user, emailName: e.target.value })} />
      <TextField label="Telefone" value={user.telefone} onChange={(e) => setUser({ ...user, telefone: e.target.value })} />
      <TextField label="LinkedIn (usuário)" value={user.linkedinName} onChange={(e) => setUser({ ...user, linkedinName: e.target.value })} />
      <TextField label="GitHub (usuário)" value={user.githubName} onChange={(e) => setUser({ ...user, githubName: e.target.value })} />

      <Typography variant="h6">Características (palavras animadas do Hero)</Typography>
      {user.caracteristicas.map((c, i) => (
        <LocalizedTextField key={i} label={`Característica ${i + 1}`} value={c} onChange={(v) => updateCaracteristica(i, v)} />
      ))}

      <Typography variant="h6">Currículo</Typography>
      <Input type="file" inputProps={{ accept: "application/pdf" }} onChange={handleResumeUpload} />
      {resumeStatus && <Typography variant="body2">{resumeStatus}</Typography>}

      <Box>
        <Button variant="contained" disabled={saving} onClick={handleSave}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </Box>
    </Container>
  );
};
