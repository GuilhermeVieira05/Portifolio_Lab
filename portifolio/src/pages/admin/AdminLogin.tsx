import React, { useState } from "react";
import { Box, Button, Container, TextField, Typography, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { login, AdminApiError } from "../../api/adminApi";

export const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(password);
      navigate("/admin");
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", bgcolor: "#2c2c2c" }}>
      <Container maxWidth="xs">
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h5" sx={{ color: "#fff" }}>Admin</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            type="password"
            label="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            fullWidth
            sx={{ bgcolor: "#fff", borderRadius: 1 }}
          />
          <Button type="submit" variant="contained" disabled={loading || password.length === 0}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};
