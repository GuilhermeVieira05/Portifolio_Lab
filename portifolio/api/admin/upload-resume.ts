import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdminSession } from "../_lib/auth/requireAdminSession";
import { createAdminAuth, createGitHubClient, withGitHubErrorHandling } from "../_lib/adminRouteHelpers";

const RESUME_PATH = "portifolio/src/assets/curriculo.pdf";
const MAX_BASE64_LENGTH = 10 * 1024 * 1024; // ~7.5MB de PDF decodificado

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const auth = createAdminAuth();

  if (!(await requireAdminSession(req, auth))) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const { fileBase64 } = req.body ?? {};
  if (typeof fileBase64 !== "string" || fileBase64.length === 0) {
    res.status(400).json({ error: "Missing fileBase64" });
    return;
  }
  if (fileBase64.length > MAX_BASE64_LENGTH) {
    res.status(413).json({ error: "File too large" });
    return;
  }

  const client = createGitHubClient();

  await withGitHubErrorHandling(res, async () => {
    const current = await client.readFile(RESUME_PATH);
    await client.writeFile({
      path: RESUME_PATH,
      content: fileBase64,
      message: "chore: update resume via admin",
      sha: current?.sha,
      encoding: "base64",
    });
    res.status(200).json({ ok: true });
  });
}
