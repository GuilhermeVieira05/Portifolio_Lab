import type { LocalizedText } from "./LocalizedText";

export type ProjectType = "Sites" | "Landing Pages" | "Aplicativos" | "E-Commerce" | "Outros" | string;

export interface CardType {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  languages: string[];
  type: string;
  status: LocalizedText;
  image?: string;
  video?: string;
  highlight?: boolean;
  date: string;
  siteLink?: string;
  gitHubLink?: string;
}
