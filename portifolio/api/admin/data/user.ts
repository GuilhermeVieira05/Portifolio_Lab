import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdminSession } from "../../_lib/auth/requireAdminSession";
import { validateUser, ValidationError } from "../../_lib/validation/validators";
import { createAdminAuth, createGitHubClient, withGitHubErrorHandling } from "../../_lib/adminRouteHelpers";

const USER_JSON_PATH = "portifolio/src/data/json/user.json";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = createAdminAuth();

  if (!(await requireAdminSession(req, auth))) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const client = createGitHubClient();

  if (req.method === "GET") {
    await withGitHubErrorHandling(res, async () => {
      const file = await client.readFile(USER_JSON_PATH);
      res.status(200).json({ user: file ? JSON.parse(file.content) : null });
    });
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

    await withGitHubErrorHandling(res, async () => {
      const current = await client.readFile(USER_JSON_PATH);
      // Merge onto the currently-stored JSON rather than overwriting wholesale:
      // the admin UI's EditableUser type intentionally omits fields it doesn't
      // render (e.g. img/curriculo, injected client-side from static assets),
      // so a blind overwrite would silently drop them from the file.
      const currentData = current ? JSON.parse(current.content) : {};
      const merged = { ...currentData, ...req.body };

      await client.writeFile({
        path: USER_JSON_PATH,
        content: JSON.stringify(merged, null, 2) + "\n",
        message: "chore: update user data via admin",
        sha: current?.sha,
      });
      res.status(200).json({ ok: true });
    });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
