import type { VercelRequest, VercelResponse } from "@vercel/node";
import { AdminAuth } from "../../_lib/auth/AdminAuth";
import { requireAdminSession } from "../../_lib/auth/requireAdminSession";
import { GitHubContentClient } from "../../_lib/github/GitHubContentClient";
import { getAdminEnv, SESSION_DURATION_SECONDS } from "../../_lib/env";
import { validateUser, ValidationError } from "../../_lib/validation/validators";

const USER_JSON_PATH = "portifolio/src/data/json/user.json";

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
    try {
      validateUser(req.body);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
        return;
      }
      throw error;
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
