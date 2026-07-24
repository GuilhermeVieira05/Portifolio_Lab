import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdminSession } from "../_lib/auth/requireAdminSession.js";
import { createAdminAuth, createGitHubClient, withGitHubErrorHandling, withErrorHandling } from "../_lib/adminRouteHelpers.js";

const MAX_BASE64_LENGTH = 30 * 1024 * 1024; // ~22.5MB decoded, generous enough for a short project video

const ALLOWED_IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp"]);
const ALLOWED_VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov"]);

// Only safe filename characters: letters, digits, dash, underscore, dot.
const SAFE_FILENAME_RE = /^[a-zA-Z0-9._-]+$/;

function extensionOf(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

export default withErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const auth = createAdminAuth();

  if (!(await requireAdminSession(req, auth))) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const { fileBase64, filename, kind } = req.body ?? {};

  if (typeof fileBase64 !== "string" || fileBase64.length === 0) {
    res.status(400).json({ error: "Missing fileBase64" });
    return;
  }
  if (fileBase64.length > MAX_BASE64_LENGTH) {
    res.status(413).json({ error: "File too large" });
    return;
  }
  if (typeof filename !== "string" || !SAFE_FILENAME_RE.test(filename)) {
    res.status(400).json({ error: "Invalid filename" });
    return;
  }
  if (kind !== "image" && kind !== "video") {
    res.status(400).json({ error: "kind must be 'image' or 'video'" });
    return;
  }

  const ext = extensionOf(filename);
  const allowed = kind === "image" ? ALLOWED_IMAGE_EXTENSIONS : ALLOWED_VIDEO_EXTENSIONS;
  if (!allowed.has(ext)) {
    res.status(400).json({ error: `Unsupported extension for ${kind}: .${ext}` });
    return;
  }

  const folder = kind === "image" ? "projectsImages" : "videos";
  const path = `portifolio/public/${folder}/${filename}`;
  const publicUrl = `/${folder}/${filename}`;

  const client = createGitHubClient();

  await withGitHubErrorHandling(res, async () => {
    const current = await client.readFile(path);
    await client.writeFile({
      path,
      content: fileBase64,
      message: `chore: upload project ${kind} (${filename}) via admin`,
      sha: current?.sha,
      encoding: "base64",
    });
    res.status(200).json({ ok: true, url: publicUrl });
  });
});
