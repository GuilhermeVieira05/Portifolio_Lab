import { SignJWT, jwtVerify } from "jose";
import { timingSafeEqual } from "node:crypto";

export type AdminAuthConfig = {
  adminPassword: string;
  jwtSecret: string;
  sessionDurationSeconds: number;
};

/**
 * Comparação e emissão/verificação de sessão para o /admin. Não sabe nada
 * sobre HTTP, cookies ou requests — recebe e devolve apenas strings/booleans.
 */
export class AdminAuth {
  private readonly config: AdminAuthConfig;

  constructor(config: AdminAuthConfig) {
    this.config = config;
  }

  verifyPassword(candidate: string): boolean {
    const expected = Buffer.from(this.config.adminPassword, "utf-8");
    const actual = Buffer.from(candidate, "utf-8");
    if (expected.length !== actual.length) return false;
    return timingSafeEqual(expected, actual);
  }

  private secretKey(): Uint8Array {
    return new TextEncoder().encode(this.config.jwtSecret);
  }

  async issueSessionToken(): Promise<string> {
    return new SignJWT({ role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${this.config.sessionDurationSeconds}s`)
      .sign(this.secretKey());
  }

  async verifySessionToken(token: string): Promise<boolean> {
    try {
      const { payload } = await jwtVerify(token, this.secretKey());
      return payload.role === "admin";
    } catch {
      return false;
    }
  }
}
