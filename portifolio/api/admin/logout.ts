import type { VercelRequest, VercelResponse } from "@vercel/node";
import { SESSION_COOKIE_NAME } from "../_lib/env";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/`
  );
  res.status(200).json({ ok: true });
}
