import { describe, expect, it } from "vitest";
import { AdminAuth } from "./AdminAuth";

const config = {
  adminPassword: "correct-horse-battery-staple",
  jwtSecret: "a-secret-that-is-long-enough-for-hs256",
  sessionDurationSeconds: 60 * 60 * 12,
};

describe("AdminAuth", () => {
  it("verifyPassword returns true for the correct password", () => {
    const auth = new AdminAuth(config);
    expect(auth.verifyPassword("correct-horse-battery-staple")).toBe(true);
  });

  it("verifyPassword returns false for an incorrect password", () => {
    const auth = new AdminAuth(config);
    expect(auth.verifyPassword("wrong-password")).toBe(false);
  });

  it("verifyPassword returns false for a password of different length", () => {
    const auth = new AdminAuth(config);
    expect(auth.verifyPassword("short")).toBe(false);
  });

  it("issueSessionToken produces a token that verifySessionToken accepts", async () => {
    const auth = new AdminAuth(config);
    const token = await auth.issueSessionToken();
    const valid = await auth.verifySessionToken(token);
    expect(valid).toBe(true);
  });

  it("verifySessionToken rejects a garbage token", async () => {
    const auth = new AdminAuth(config);
    const valid = await auth.verifySessionToken("not-a-real-token");
    expect(valid).toBe(false);
  });

  it("verifySessionToken rejects a token signed with a different secret", async () => {
    const auth = new AdminAuth(config);
    const otherAuth = new AdminAuth({ ...config, jwtSecret: "a-completely-different-secret-value" });
    const token = await otherAuth.issueSessionToken();
    const valid = await auth.verifySessionToken(token);
    expect(valid).toBe(false);
  });
});
