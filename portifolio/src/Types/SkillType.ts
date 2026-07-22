export type SkillCategory =
  | "Frontend"
  | "Backend"
  | "Mobile"
  | "Database"
  | "DevOps"
  | "Testing"
  | "Design"
  | "Tools"
  | "Outros";

export interface SkillData {
  id: string;
  name: string;
  iconName: string;
  category: SkillCategory;
  color: string;
  bg: string;
  ariaLabel: string;
}
