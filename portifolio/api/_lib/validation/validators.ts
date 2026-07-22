import { KNOWN_SKILL_ICON_NAMES, KNOWN_SERVICE_ICON_NAMES } from "./knownIconNames";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isLocalizedText(value: unknown): value is { pt: string; en: string } {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return isNonEmptyString(v.pt) && isNonEmptyString(v.en);
}

function requireLocalizedText(value: unknown, field: string): void {
  if (!isLocalizedText(value)) {
    throw new ValidationError(`${field} must be an object with non-empty "pt" and "en" strings`);
  }
}

function requireNonEmptyString(value: unknown, field: string): void {
  if (!isNonEmptyString(value)) {
    throw new ValidationError(`${field} must be a non-empty string`);
  }
}

const MONTH_YEAR_RE = /^(0[1-9]|1[0-2])\/\d{4}$/;

function requireMonthYear(value: unknown, field: string): void {
  if (typeof value !== "string" || !MONTH_YEAR_RE.test(value)) {
    throw new ValidationError(`${field} must be in MM/YYYY format`);
  }
}

function asRecord(data: unknown, label: string): Record<string, unknown> {
  if (typeof data !== "object" || data === null) {
    throw new ValidationError(`${label} must be an object`);
  }
  return data as Record<string, unknown>;
}

export function validateExperience(data: unknown): void {
  const d = asRecord(data, "experience");

  requireNonEmptyString(d.id, "id");
  requireLocalizedText(d.role, "role");
  requireLocalizedText(d.company, "company");
  requireMonthYear(d.startDate, "startDate");
  // finalDate is required but nullable — an omitted key (undefined) is NOT
  // treated the same as explicit null, and fails requireMonthYear below.
  if (d.finalDate !== null) {
    requireMonthYear(d.finalDate, "finalDate");
  }
  requireLocalizedText(d.description, "description");
  requireLocalizedText(d.type, "type");
}

export function validateProject(data: unknown): void {
  const d = asRecord(data, "project");

  requireNonEmptyString(d.id, "id");
  requireLocalizedText(d.title, "title");
  requireLocalizedText(d.description, "description");
  if (!Array.isArray(d.languages) || !d.languages.every((l) => typeof l === "string")) {
    throw new ValidationError("languages must be an array of strings");
  }
  requireNonEmptyString(d.type, "type");
  requireLocalizedText(d.status, "status");
  requireNonEmptyString(d.date, "date");
}

const VALID_SKILL_CATEGORIES = new Set([
  "Frontend",
  "Backend",
  "Mobile",
  "Database",
  "DevOps",
  "Testing",
  "Design",
  "Tools",
  "Outros",
]);

export function validateSkill(data: unknown): void {
  const d = asRecord(data, "skill");

  requireNonEmptyString(d.id, "id");
  requireNonEmptyString(d.name, "name");
  requireNonEmptyString(d.iconName, "iconName");
  if (typeof d.iconName === "string" && !KNOWN_SKILL_ICON_NAMES.has(d.iconName)) {
    throw new ValidationError(`iconName "${d.iconName}" is not a recognized skill icon`);
  }
  if (typeof d.category !== "string" || !VALID_SKILL_CATEGORIES.has(d.category)) {
    throw new ValidationError(`category must be one of ${[...VALID_SKILL_CATEGORIES].join(", ")}`);
  }
  requireNonEmptyString(d.color, "color");
  requireNonEmptyString(d.bg, "bg");
  requireNonEmptyString(d.ariaLabel, "ariaLabel");
}

export function validateService(data: unknown): void {
  const d = asRecord(data, "service");

  requireNonEmptyString(d.iconName, "iconName");
  if (typeof d.iconName === "string" && !KNOWN_SERVICE_ICON_NAMES.has(d.iconName)) {
    throw new ValidationError(`iconName "${d.iconName}" is not a recognized service icon`);
  }
  requireLocalizedText(d.title, "title");
  requireLocalizedText(d.description, "description");
}
