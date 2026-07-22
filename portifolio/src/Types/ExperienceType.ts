import type { LocalizedText } from "./LocalizedText";

export interface ExperienceType {
  id: string;
  role: LocalizedText;
  company: LocalizedText;
  startDate: string;
  finalDate: string | null;
  description: LocalizedText;
  type: LocalizedText;
}
