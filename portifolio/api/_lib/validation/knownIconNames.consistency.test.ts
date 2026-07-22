import { describe, expect, it } from "vitest";
import { skillIconRegistry, serviceIconRegistry } from "../../../src/lib/iconRegistry";
import { KNOWN_SKILL_ICON_NAMES, KNOWN_SERVICE_ICON_NAMES } from "./knownIconNames";

describe("knownIconNames consistency with iconRegistry", () => {
  it("KNOWN_SKILL_ICON_NAMES matches skillIconRegistry keys exactly", () => {
    expect(KNOWN_SKILL_ICON_NAMES).toEqual(new Set(Object.keys(skillIconRegistry)));
  });

  it("KNOWN_SERVICE_ICON_NAMES matches serviceIconRegistry keys exactly", () => {
    expect(KNOWN_SERVICE_ICON_NAMES).toEqual(new Set(Object.keys(serviceIconRegistry)));
  });
});
