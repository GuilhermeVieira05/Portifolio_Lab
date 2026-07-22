import { validateExperience, validateProject, validateSkill, validateService } from "../validation/validators";

export type ResourceName = "experiences" | "projects" | "skills" | "services";

type ResourceDefinition = {
  path: string;
  validateItem: (item: unknown) => void;
};

export const RESOURCE_REGISTRY: Record<ResourceName, ResourceDefinition> = {
  experiences: {
    path: "portifolio/src/data/json/experiences.json",
    validateItem: validateExperience,
  },
  projects: {
    path: "portifolio/src/data/json/projects.json",
    validateItem: validateProject,
  },
  skills: {
    path: "portifolio/src/data/json/skills.json",
    validateItem: validateSkill,
  },
  services: {
    path: "portifolio/src/data/json/services.json",
    validateItem: validateService,
  },
};

export function isResourceName(value: string): value is ResourceName {
  return value in RESOURCE_REGISTRY;
}
