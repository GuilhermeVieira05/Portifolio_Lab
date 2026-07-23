import { AdminAuth } from "./auth/AdminAuth";
import { GitHubContentClient } from "./github/GitHubContentClient";
import { getAdminEnv, SESSION_DURATION_SECONDS } from "./env";

export function createAdminAuth(): AdminAuth {
  const env = getAdminEnv();
  return new AdminAuth({
    adminPassword: env.adminPassword,
    jwtSecret: env.jwtSecret,
    sessionDurationSeconds: SESSION_DURATION_SECONDS,
  });
}

export function createGitHubClient(): GitHubContentClient {
  const env = getAdminEnv();
  return new GitHubContentClient({
    owner: env.githubOwner,
    repo: env.githubRepo,
    token: env.githubToken,
    branch: env.githubBranch,
  });
}

/**
 * Wraps a route handler body that talks to the GitHub Contents API, turning
 * any GitHubContentClient failure (stale sha / rate limit / network error)
 * into a 502 response carrying GitHub's own error message, instead of an
 * opaque unhandled 500 with no body.
 */
export async function withGitHubErrorHandling(
  res: { status: (code: number) => { json: (body: unknown) => void } },
  fn: () => Promise<void>
): Promise<void> {
  try {
    await fn();
  } catch (error) {
    res.status(502).json({
      error: error instanceof Error ? error.message : "GitHub request failed",
    });
  }
}
