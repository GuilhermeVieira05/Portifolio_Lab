export type GitHubContentClientConfig = {
  owner: string;
  repo: string;
  token: string;
  branch: string;
};

export type ReadFileResult = {
  content: string;
  sha: string;
};

export type WriteFileParams = {
  path: string;
  content: string;
  message: string;
  sha?: string;
};

/**
 * Único ponto de contato com a GitHub Contents API. Não conhece o domínio
 * (experiências, projetos, etc.) — apenas lê/escreve arquivos por caminho.
 */
export class GitHubContentClient {
  private readonly config: GitHubContentClientConfig;

  constructor(config: GitHubContentClientConfig) {
    this.config = config;
  }

  private buildUrl(path: string): string {
    const encodedPath = path.split("/").map(encodeURIComponent).join("/");
    return `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${encodedPath}`;
  }

  private authHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.config.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
  }

  private async errorMessage(response: Response, fallback: string): Promise<string> {
    const body = await response.json().catch(() => null) as { message?: string } | null;
    return body?.message ? `${fallback}: ${body.message}` : fallback;
  }

  async readFile(path: string): Promise<ReadFileResult | null> {
    const response = await fetch(
      `${this.buildUrl(path)}?ref=${this.config.branch}`,
      { headers: this.authHeaders() }
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(
        await this.errorMessage(response, `GitHub API error ${response.status} reading ${path}`)
      );
    }

    const data = (await response.json()) as { content: string; sha: string };
    return {
      content: Buffer.from(data.content, "base64").toString("utf-8"),
      sha: data.sha,
    };
  }

  async writeFile(params: WriteFileParams): Promise<void> {
    const response = await fetch(this.buildUrl(params.path), {
      method: "PUT",
      headers: {
        ...this.authHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: params.message,
        content: Buffer.from(params.content, "utf-8").toString("base64"),
        branch: this.config.branch,
        ...(params.sha ? { sha: params.sha } : {}),
      }),
    });

    if (!response.ok) {
      throw new Error(
        await this.errorMessage(response, `GitHub API error ${response.status} writing ${params.path}`)
      );
    }
  }
}
