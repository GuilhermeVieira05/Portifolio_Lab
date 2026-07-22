import type { VercelRequest } from "@vercel/node";
import type { AdminAuth } from "./AdminAuth";
import { SESSION_COOKIE_NAME } from "../env";

function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(
    header.split(";").map((pair) => {
      const [key, ...rest] = pair.trim().split("=");
      return [key, rest.join("=")];
    })
  );
}

export async function requireAdminSession(
  req: VercelRequest,
  auth: AdminAuth
): Promise<boolean> {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) return false;
  return auth.verifySessionToken(token);
}
