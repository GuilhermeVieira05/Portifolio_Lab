import type { LocalizedText } from "./LocalizedText";

export type User = {
  name: string;
  img?: string;
  desc: LocalizedText;
  emailName: string;
  linkedinName: string;
  githubName: string;
  links?: {
    github?: string;
    linkedin?: string;
    email?: string;
    whatsapp?: string;
  };
  telefone: string;
  curriculo: string;
  caracteristicas: LocalizedText[];
};
