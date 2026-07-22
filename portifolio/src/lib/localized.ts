import type { LocalizedText } from "../Types/LocalizedText";

export function localize(text: LocalizedText, language: string): string {
  return language === "pt" ? text.pt : text.en;
}
