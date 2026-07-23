import React, { useState } from "react";
import { Box, Button, Container, TextField, Typography, Alert, Paper, Avatar } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
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
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        px: 2,
      }}
    >
      <Container maxWidth="xs" disableGutters>
        <Paper
          elevation={0}
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: { xs: 3, sm: 4 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2.5,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
            <LockOutlinedIcon />
          </Avatar>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h5" fontWeight={700}>
              Área administrativa
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Entre com a senha para gerenciar o conteúdo do site
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ width: "100%" }}>
              {error}
            </Alert>
          )}

          <TextField
            type="password"
            label="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            fullWidth
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading || password.length === 0}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};
