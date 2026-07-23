import React from "react";
import { Box, TextField } from "@mui/material";
import type { LocalizedText } from "../../../Types/LocalizedText";

type Props = {
  label: string;
  value: LocalizedText;
  onChange: (next: LocalizedText) => void;
  multiline?: boolean;
};

export const LocalizedTextField: React.FC<Props> = ({ label, value, onChange, multiline }) => (
  <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
    <TextField
      label={`${label} (PT)`}
      value={value.pt}
      onChange={(e) => onChange({ ...value, pt: e.target.value })}
      multiline={multiline}
      minRows={multiline ? 3 : undefined}
      fullWidth
    />
    <TextField
      label={`${label} (EN)`}
      value={value.en}
      onChange={(e) => onChange({ ...value, en: e.target.value })}
      multiline={multiline}
      minRows={multiline ? 3 : undefined}
      fullWidth
    />
  </Box>
);
