import type { VercelRequest, VercelResponse } from "@vercel/node";
import { AdminAuth } from "../../_lib/auth/AdminAuth";
import { requireAdminSession } from "../../_lib/auth/requireAdminSession";
import { GitHubContentClient } from "../../_lib/github/GitHubContentClient";
import { JsonResourceRepository } from "../../_lib/data/JsonResourceRepository";
import { RESOURCE_REGISTRY, isResourceName } from "../../_lib/data/resourceRegistry";
import { ValidationError } from "../../_lib/validation/validators";
import { getAdminEnv, SESSION_DURATION_SECONDS } from "../../_lib/env";

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

  const resourceParam = req.query.resource;
  const resource = typeof resourceParam === "string" ? resourceParam : "";
  if (!isResourceName(resource)) {
    res.status(404).json({ error: `Unknown resource: ${resource}` });
    return;
  }

  const definition = RESOURCE_REGISTRY[resource];
  const client = new GitHubContentClient({
    owner: env.githubOwner,
    repo: env.githubRepo,
    token: env.githubToken,
    branch: env.githubBranch,
  });
  const repository = new JsonResourceRepository<unknown>(client, definition.path);

  if (req.method === "GET") {
    const items = await repository.list();
    res.status(200).json({ items });
    return;
  }

  if (req.method === "PUT") {
    const items = req.body?.items;
    if (!Array.isArray(items)) {
      res.status(400).json({ error: "Body must be { items: [...] }" });
      return;
    }

    try {
      items.forEach(definition.validateItem);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
        return;
      }
      throw error;
    }

    await repository.replaceAll(items, `chore: update ${resource} via admin`);
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
