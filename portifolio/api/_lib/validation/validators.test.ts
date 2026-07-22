import { describe, expect, it } from "vitest";
import {
  validateExperience,
  validateProject,
  validateSkill,
  validateService,
  validateUser,
  ValidationError,
} from "./validators";

describe("validateExperience", () => {
  const valid = {
    id: "exp-1",
    role: { pt: "Dev", en: "Dev" },
    company: { pt: "Empresa", en: "Company" },
    startDate: "01/2025",
    finalDate: null,
    description: { pt: "desc", en: "desc" },
    type: { pt: "Trabalho", en: "Work" },
  };

  it("accepts a well-formed experience", () => {
    expect(() => validateExperience(valid)).not.toThrow();
  });

  it("rejects a missing id", () => {
    const { id, ...rest } = valid;
    expect(() => validateExperience(rest)).toThrow(ValidationError);
  });

  it("rejects a role missing the english translation", () => {
    expect(() =>
      validateExperience({ ...valid, role: { pt: "Dev" } })
    ).toThrow(ValidationError);
  });

  it("rejects a startDate not in MM/YYYY format", () => {
    expect(() => validateExperience({ ...valid, startDate: "2025-01" })).toThrow(
      ValidationError
    );
  });

  it("accepts a null finalDate", () => {
    expect(() => validateExperience({ ...valid, finalDate: null })).not.toThrow();
  });
});

describe("validateProject", () => {
  const valid = {
    id: "proj-1",
    title: { pt: "Projeto", en: "Project" },
    description: { pt: "desc", en: "desc" },
    languages: ["React", "TypeScript"],
    type: "Sites",
    status: { pt: "Concluído", en: "Done" },
    date: "01/05/2023",
  };

  it("accepts a well-formed project", () => {
    expect(() => validateProject(valid)).not.toThrow();
  });

  it("rejects languages that is not an array of strings", () => {
    expect(() => validateProject({ ...valid, languages: "React" })).toThrow(
      ValidationError
    );
  });

  it("rejects a missing title", () => {
    const { title, ...rest } = valid;
    expect(() => validateProject(rest)).toThrow(ValidationError);
  });
});

describe("validateSkill", () => {
  const valid = {
    id: "skill-1",
    name: "React",
    iconName: "SiReact",
    category: "Frontend",
    color: "#61DAFB",
    bg: "#0B2C3C",
    ariaLabel: "React",
  };

  it("accepts a well-formed skill", () => {
    expect(() => validateSkill(valid)).not.toThrow();
  });

  it("rejects an unknown category", () => {
    expect(() => validateSkill({ ...valid, category: "Blockchain" })).toThrow(
      ValidationError
    );
  });

  it("rejects an unrecognized skill iconName", () => {
    expect(() => validateSkill({ ...valid, iconName: "NotARealIcon" })).toThrow(ValidationError);
  });
});

describe("validateService", () => {
  const valid = {
    iconName: "Language",
    title: { pt: "Sites", en: "Websites" },
    description: { pt: "desc", en: "desc" },
  };

  it("accepts a well-formed service", () => {
    expect(() => validateService(valid)).not.toThrow();
  });

  it("rejects a missing iconName", () => {
    const { iconName, ...rest } = valid;
    expect(() => validateService(rest)).toThrow(ValidationError);
  });

  it("rejects an unrecognized service iconName", () => {
    expect(() => validateService({ ...valid, iconName: "NotARealIcon" })).toThrow(ValidationError);
  });
});

describe("validateUser", () => {
  const valid = {
    name: "Guilherme Vieira",
    emailName: "guilhermearv3@gmail.com",
    telefone: "+5531986991214",
    caracteristicas: [{ pt: "Fullstack", en: "Fullstack" }],
  };

  it("accepts a well-formed user", () => {
    expect(() => validateUser(valid)).not.toThrow();
  });

  it("rejects a missing name", () => {
    const { name, ...rest } = valid;
    expect(() => validateUser(rest)).toThrow(ValidationError);
  });

  it("rejects caracteristicas that is not an array", () => {
    expect(() => validateUser({ ...valid, caracteristicas: "Fullstack" })).toThrow(ValidationError);
  });
});
