import type { VercelRequest, VercelResponse } from "@vercel/node";
import { AdminAuth } from "../../_lib/auth/AdminAuth";
import { requireAdminSession } from "../../_lib/auth/requireAdminSession";
import { GitHubContentClient } from "../../_lib/github/GitHubContentClient";
import { getAdminEnv, SESSION_DURATION_SECONDS } from "../../_lib/env";

const USER_JSON_PATH = "portifolio/src/data/json/user.json";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateUser(data: unknown): string | null {
  if (typeof data !== "object" || data === null) return "user must be an object";
  const d = data as Record<string, unknown>;
  if (!isNonEmptyString(d.name)) return "name must be a non-empty string";
  if (!isNonEmptyString(d.emailName)) return "emailName must be a non-empty string";
  if (!isNonEmptyString(d.telefone)) return "telefone must be a non-empty string";
  if (!Array.isArray(d.caracteristicas)) return "caracteristicas must be an array";
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const env = getAdminEnv();
  const auth = new AdminAuth({
    adminPassword: env.adminPassword,
    jwtSecret: env.jwtSecret,
    sessionDurationSeconds: SESSION_DURATION_SECONDS,
  });

  if (!(await requireAdminSession(req, auth))) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const client = new GitHubContentClient({
    owner: env.githubOwner,
    repo: env.githubRepo,
    token: env.githubToken,
    branch: env.githubBranch,
  });

  if (req.method === "GET") {
    const file = await client.readFile(USER_JSON_PATH);
    res.status(200).json({ user: file ? JSON.parse(file.content) : null });
    return;
  }

  if (req.method === "PUT") {
    const error = validateUser(req.body);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    const current = await client.readFile(USER_JSON_PATH);
    await client.writeFile({
      path: USER_JSON_PATH,
      content: JSON.stringify(req.body, null, 2) + "\n",
      message: "chore: update user data via admin",
      sha: current?.sha,
    });
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
