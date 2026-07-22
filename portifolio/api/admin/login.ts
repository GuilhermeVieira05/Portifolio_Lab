import type { VercelRequest, VercelResponse } from "@vercel/node";
import { AdminAuth } from "../_lib/auth/AdminAuth";
import { LoginRateLimiter } from "../_lib/auth/LoginRateLimiter";
import { getAdminEnv, SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS } from "../_lib/env";

// Best-effort brute-force guard, not a hard guarantee: Vercel serverless
// instances are ephemeral and requests can land on different warm instances
// with no shared state, so this mainly slows down naive single-threaded
// guessing. Acceptable for this project's threat model (single admin, low
// traffic) — see LoginRateLimiter's own doc comment for the cold-start caveat.
const rateLimiter = new LoginRateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
});

function clientKey(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress ?? "unknown";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const key = clientKey(req);
  if (rateLimiter.isBlocked(key)) {
    res.status(429).json({ error: "Too many attempts. Try again later." });
    return;
  }

  const { password } = req.body ?? {};
  if (typeof password !== "string") {
    res.status(400).json({ error: "Missing password" });
    return;
  }

  const env = getAdminEnv();
  const auth = new AdminAuth({
    adminPassword: env.adminPassword,
    jwtSecret: env.jwtSecret,
    sessionDurationSeconds: SESSION_DURATION_SECONDS,
  });

  if (!auth.verifyPassword(password)) {
    rateLimiter.recordFailedAttempt(key);
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  rateLimiter.clearAttempts(key);
  const token = await auth.issueSessionToken();

  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_DURATION_SECONDS}; Path=/`
  );
  res.status(200).json({ ok: true });
}
