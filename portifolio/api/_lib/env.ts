function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getAdminEnv() {
  return {
    adminPassword: requireEnv("ADMIN_PASSWORD"),
    jwtSecret: requireEnv("ADMIN_JWT_SECRET"),
    githubToken: requireEnv("GITHUB_TOKEN"),
    githubOwner: process.env.GITHUB_OWNER ?? "GuilhermeVieira05",
    githubRepo: process.env.GITHUB_REPO ?? "Portifolio_Lab",
    githubBranch: process.env.GITHUB_BRANCH ?? "main",
  };
}

export const SESSION_DURATION_SECONDS = 60 * 60 * 12;
export const SESSION_COOKIE_NAME = "admin_session";
