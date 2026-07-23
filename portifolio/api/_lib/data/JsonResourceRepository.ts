import type { GitHubContentClient } from "../github/GitHubContentClient.js";

/**
 * Lê/escreve um array JSON completo em um único arquivo do repositório,
 * via um GitHubContentClient. Não valida o shape de T — isso é
 * responsabilidade de um validador específico do recurso, aplicado antes
 * de chamar replaceAll.
 *
 * replaceAll faz dois round-trips (readFile para obter o sha atual, depois
 * writeFile) — uma escrita concorrente nesse intervalo faz o GitHub rejeitar
 * o PUT com um erro de sha desatualizado, em vez de sobrescrever silenciosamente.
 */
export class JsonResourceRepository<T> {
  private readonly client: GitHubContentClient;
  private readonly path: string;

  constructor(client: GitHubContentClient, path: string) {
    this.client = client;
    this.path = path;
  }

  async list(): Promise<T[]> {
    const file = await this.client.readFile(this.path);
    if (!file) return [];
    const parsed: unknown = JSON.parse(file.content);
    if (!Array.isArray(parsed)) {
      throw new Error(`Expected ${this.path} to contain a JSON array`);
    }
    return parsed as T[];
  }

  async replaceAll(items: T[], commitMessage: string): Promise<void> {
    const file = await this.client.readFile(this.path);
    await this.client.writeFile({
      path: this.path,
      content: JSON.stringify(items, null, 2) + "\n",
      message: commitMessage,
      sha: file?.sha,
    });
  }
}
