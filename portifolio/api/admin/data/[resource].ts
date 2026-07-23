import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdminSession } from "../../_lib/auth/requireAdminSession.js";
import { JsonResourceRepository } from "../../_lib/data/JsonResourceRepository.js";
import { RESOURCE_REGISTRY, isResourceName } from "../../_lib/data/resourceRegistry.js";
import { ValidationError } from "../../_lib/validation/validators.js";
import { createAdminAuth, createGitHubClient, withGitHubErrorHandling, withErrorHandling } from "../../_lib/adminRouteHelpers.js";

export default withErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = createAdminAuth();

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
  const client = createGitHubClient();
  const repository = new JsonResourceRepository<unknown>(client, definition.path);

  if (req.method === "GET") {
    await withGitHubErrorHandling(res, async () => {
      const items = await repository.list();
      res.status(200).json({ items });
    });
    return;
  }

  if (req.method === "PUT") {
    const items = req.body?.items;
    if (!Array.isArray(items)) {
      res.status(400).json({ error: "Body must be { items: [...] }" });
      return;
    }

    try {
      items.forEach((item, index) => {
        try {
          definition.validateItem(item);
        } catch (error) {
          if (error instanceof ValidationError) {
            throw new ValidationError(`item at index ${index}: ${error.message}`);
          }
          throw error;
        }
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
        return;
      }
      throw error;
    }

    await withGitHubErrorHandling(res, async () => {
      await repository.replaceAll(items, `chore: update ${resource} via admin`);
      res.status(200).json({ ok: true });
    });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
