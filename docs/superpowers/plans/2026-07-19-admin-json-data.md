# Dados Dinâmicos via JSON + Rota /admin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar experiências, projetos, skills, serviços e dados pessoais de arquivos `.ts` hardcoded para JSON bilíngue versionado no repositório, editável através de uma rota `/admin` autenticada por senha, que persiste as mudanças via commits na GitHub Contents API.

**Architecture:** Camadas com responsabilidade única, testáveis isoladamente e injetáveis por composição (sem framework de DI — construtor simples recebendo dependências):
- **`GitHubContentClient`** — único ponto de contato com a GitHub Contents API (ler/escrever arquivo, obter SHA). Não sabe nada sobre "experiências" ou "projetos".
- **`JsonResourceRepository<T>`** — genérico, sabe ler/escrever um recurso JSON via um `GitHubContentClient`, decodificando/codificando base64 e resolvendo o SHA antes de escrever. Não sabe validar o shape de `T`.
- **Um validador por recurso** (`validateExperience`, `validateProject`, etc.) — funções puras que verificam o shape de cada tipo antes de persistir. Sem validador não passa pro repositório.
- **`AdminAuth`** — encapsula emissão/verificação do cookie JWT e comparação de senha em tempo constante. Não sabe nada sobre HTTP.
- **API routes (Vercel functions)** — camada fina que faz parsing do request, chama `AdminAuth`/`JsonResourceRepository`, e formata a resposta HTTP. Sem lógica de negócio própria.
- **Frontend `/admin`** — formulários MUI reaproveitando o padrão visual do site, um hook `useAdminResource(resource)` por recurso que encapsula fetch/save contra as API routes.

Essa separação (client HTTP puro / repositório genérico / validação por tipo / auth / rotas finas) é o que permite testar a lógica de commit e de auth sem subir um servidor Vercel nem bater na API real do GitHub — o `GitHubContentClient` é a única peça que fala com a rede, e é mockável nos testes das camadas acima dele.

**Tech Stack:** TypeScript, Vercel serverless functions (`@vercel/node`), `jose` (JWT via Web Crypto, sem dependência nativa), Vitest (test runner novo no projeto — não havia nenhum framework de teste configurado), React 19, MUI, react-router-dom.

---

### Task 0: Configurar Vitest no projeto

Não existe test runner configurado. Esta task instala e configura o mínimo necessário para testar módulos TypeScript puros (sem depender do DOM).

**Files:**
- Create: `portifolio/vitest.config.ts`
- Modify: `portifolio/package.json`

- [ ] **Step 1: Instalar vitest**

```bash
cd portifolio && npm install -D vitest
```

- [ ] **Step 2: Criar `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "api/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Adicionar script `test` ao `package.json`**

Em `portifolio/package.json`, dentro de `"scripts"`, adicionar:

```json
    "test": "vitest run",
```

- [ ] **Step 4: Rodar para confirmar que o runner funciona sem nenhum teste ainda**

```bash
cd portifolio && npm run test
```

Expected: saída indicando "No test files found" (ou 0 testes), sem erro de configuração.

- [ ] **Step 5: Commit**

```bash
git add portifolio/package.json portifolio/package-lock.json portifolio/vitest.config.ts
git commit -m "chore: add vitest as test runner"
```

- [ ] **Step 6: Ampliar `tsconfig.app.json` para cobrir todo o diretório `api/`**

O `tsconfig.app.json` atual só inclui `"api/ping.ts"` individualmente, não o diretório `api/` inteiro. As próximas tasks criam vários arquivos novos sob `api/_lib/` e `api/admin/` que precisam ser cobertos pelo typecheck do projeto (`npx tsc -b --noEmit`), senão erros de tipo nesses arquivos passariam despercebidos.

Em `portifolio/tsconfig.app.json`, trocar:

```json
  "include": ["src", "api/ping.ts"]
```

por:

```json
  "include": ["src", "api"]
```

- [ ] **Step 7: Confirmar que o typecheck ainda passa com o include ampliado**

```bash
cd portifolio && npx tsc -b --noEmit
```

Expected: sem erros (nesta altura só existe `api/ping.ts`, já coberto antes; a mudança apenas amplia o escopo para os arquivos que serão criados nas próximas tasks).

- [ ] **Step 8: Commit**

```bash
git add portifolio/tsconfig.app.json
git commit -m "chore: widen tsconfig include to cover the whole api/ directory"
```

**Nota importante sobre estilo de código nas próximas tasks:** o `tsconfig.app.json` deste projeto tem `"erasableSyntaxOnly": true`, que **proíbe TypeScript parameter properties** (o atalho `constructor(private readonly x: T) {}`). Todo construtor nas classes deste plano deve declarar o campo explicitamente e atribuí-lo no corpo do construtor, por exemplo:

```ts
export class Example {
  private readonly config: ExampleConfig;

  constructor(config: ExampleConfig) {
    this.config = config;
  }
}
```

Os blocos de código nas próximas tasks já foram escritos seguindo esse padrão.

---

### Task 1: `GitHubContentClient` — client HTTP isolado para a GitHub Contents API

**Files:**
- Create: `portifolio/api/_lib/github/GitHubContentClient.ts`
- Test: `portifolio/api/_lib/github/GitHubContentClient.test.ts`

O prefixo `_lib/` (convenção Vercel) marca esse diretório como código auxiliar que não vira uma rota HTTP própria.

- [ ] **Step 1: Escrever o teste**

```ts
// portifolio/api/_lib/github/GitHubContentClient.test.ts
import { describe, expect, it, vi, beforeEach } from "vitest";
import { GitHubContentClient } from "./GitHubContentClient";

describe("GitHubContentClient", () => {
  const config = {
    owner: "GuilhermeVieira05",
    repo: "Portifolio_Lab",
    token: "fake-token",
    branch: "main",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("readFile decodes base64 content and returns sha", async () => {
    const encoded = Buffer.from('{"hello":"world"}', "utf-8").toString("base64");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ content: encoded, sha: "abc123" }),
    }) as unknown as typeof fetch;

    const client = new GitHubContentClient(config);
    const result = await client.readFile("portifolio/src/data/json/experiences.json");

    expect(result).toEqual({ content: '{"hello":"world"}', sha: "abc123" });
  });

  it("readFile returns null when the file does not exist (404)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: "Not Found" }),
    }) as unknown as typeof fetch;

    const client = new GitHubContentClient(config);
    const result = await client.readFile("portifolio/src/data/json/missing.json");

    expect(result).toBeNull();
  });

  it("readFile throws for non-404 error responses", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: "Internal Server Error" }),
    }) as unknown as typeof fetch;

    const client = new GitHubContentClient(config);
    await expect(
      client.readFile("portifolio/src/data/json/experiences.json")
    ).rejects.toThrow("GitHub API error 500");
  });

  it("writeFile sends base64-encoded content with the sha and commit message", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ commit: { sha: "newsha" } }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const client = new GitHubContentClient(config);
    await client.writeFile({
      path: "portifolio/src/data/json/experiences.json",
      content: '{"a":1}',
      message: "chore: update experiences via admin",
      sha: "abc123",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://api.github.com/repos/GuilhermeVieira05/Portifolio_Lab/contents/portifolio/src/data/json/experiences.json"
    );
    const body = JSON.parse(options.body as string);
    expect(body.message).toBe("chore: update experiences via admin");
    expect(body.sha).toBe("abc123");
    expect(body.branch).toBe("main");
    expect(Buffer.from(body.content, "base64").toString("utf-8")).toBe('{"a":1}');
  });

  it("writeFile omits sha when creating a new file", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ commit: { sha: "newsha" } }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const client = new GitHubContentClient(config);
    await client.writeFile({
      path: "portifolio/src/assets/curriculo.pdf",
      content: "base64pdfcontent",
      message: "chore: update resume",
    });

    const [, options] = fetchMock.mock.calls[0];
    const body = JSON.parse((options as RequestInit).body as string);
    expect(body.sha).toBeUndefined();
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha por falta de implementação**

```bash
cd portifolio && npx vitest run api/_lib/github/GitHubContentClient.test.ts
```

Expected: FAIL — `Cannot find module './GitHubContentClient'`.

- [ ] **Step 3: Implementar `GitHubContentClient`**

```ts
// portifolio/api/_lib/github/GitHubContentClient.ts

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
    return `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${path}`;
  }

  private authHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.config.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
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
      throw new Error(`GitHub API error ${response.status} reading ${path}`);
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
      throw new Error(`GitHub API error ${response.status} writing ${params.path}`);
    }
  }
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

```bash
cd portifolio && npx vitest run api/_lib/github/GitHubContentClient.test.ts
```

Expected: PASS — 5 testes.

- [ ] **Step 5: Commit**

```bash
git add portifolio/api/_lib/github/GitHubContentClient.ts portifolio/api/_lib/github/GitHubContentClient.test.ts
git commit -m "feat: add GitHubContentClient for reading/writing repo files via commits"
```

---

### Task 2: `JsonResourceRepository<T>` — repositório genérico sobre o client

**Files:**
- Create: `portifolio/api/_lib/data/JsonResourceRepository.ts`
- Test: `portifolio/api/_lib/data/JsonResourceRepository.test.ts`

- [ ] **Step 1: Escrever o teste**

```ts
// portifolio/api/_lib/data/JsonResourceRepository.test.ts
import { describe, expect, it, vi } from "vitest";
import { JsonResourceRepository } from "./JsonResourceRepository";
import type { GitHubContentClient } from "../github/GitHubContentClient";

type Item = { id: string; name: string };

function fakeClient(overrides: Partial<GitHubContentClient> = {}): GitHubContentClient {
  return {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    ...overrides,
  } as unknown as GitHubContentClient;
}

describe("JsonResourceRepository", () => {
  it("list parses the JSON array from the file content", async () => {
    const client = fakeClient({
      readFile: vi.fn().mockResolvedValue({
        content: JSON.stringify([{ id: "1", name: "a" }]),
        sha: "sha1",
      }),
    });
    const repo = new JsonResourceRepository<Item>(client, "path/items.json");

    const items = await repo.list();

    expect(items).toEqual([{ id: "1", name: "a" }]);
  });

  it("list returns an empty array when the file does not exist yet", async () => {
    const client = fakeClient({ readFile: vi.fn().mockResolvedValue(null) });
    const repo = new JsonResourceRepository<Item>(client, "path/items.json");

    const items = await repo.list();

    expect(items).toEqual([]);
  });

  it("replaceAll writes the serialized array using the current sha", async () => {
    const writeFile = vi.fn().mockResolvedValue(undefined);
    const client = fakeClient({
      readFile: vi.fn().mockResolvedValue({ content: "[]", sha: "sha-current" }),
      writeFile,
    });
    const repo = new JsonResourceRepository<Item>(client, "path/items.json");

    await repo.replaceAll([{ id: "1", name: "a" }], "chore: update items via admin");

    expect(writeFile).toHaveBeenCalledWith({
      path: "path/items.json",
      content: JSON.stringify([{ id: "1", name: "a" }], null, 2) + "\n",
      message: "chore: update items via admin",
      sha: "sha-current",
    });
  });

  it("replaceAll writes without a sha when the file does not exist yet", async () => {
    const writeFile = vi.fn().mockResolvedValue(undefined);
    const client = fakeClient({
      readFile: vi.fn().mockResolvedValue(null),
      writeFile,
    });
    const repo = new JsonResourceRepository<Item>(client, "path/items.json");

    await repo.replaceAll([{ id: "1", name: "a" }], "chore: create items via admin");

    const call = writeFile.mock.calls[0][0];
    expect(call.sha).toBeUndefined();
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

```bash
cd portifolio && npx vitest run api/_lib/data/JsonResourceRepository.test.ts
```

Expected: FAIL — módulo não encontrado.

- [ ] **Step 3: Implementar `JsonResourceRepository`**

```ts
// portifolio/api/_lib/data/JsonResourceRepository.ts
import type { GitHubContentClient } from "../github/GitHubContentClient";

/**
 * Lê/escreve um array JSON completo em um único arquivo do repositório,
 * via um GitHubContentClient. Não valida o shape de T — isso é
 * responsabilidade de um validador específico do recurso, aplicado antes
 * de chamar replaceAll.
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
    return JSON.parse(file.content) as T[];
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
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

```bash
cd portifolio && npx vitest run api/_lib/data/JsonResourceRepository.test.ts
```

Expected: PASS — 4 testes.

- [ ] **Step 5: Commit**

```bash
git add portifolio/api/_lib/data/JsonResourceRepository.ts portifolio/api/_lib/data/JsonResourceRepository.test.ts
git commit -m "feat: add generic JsonResourceRepository over GitHubContentClient"
```

---

### Task 3: `AdminAuth` — senha e sessão JWT

**Files:**
- Create: `portifolio/api/_lib/auth/AdminAuth.ts`
- Test: `portifolio/api/_lib/auth/AdminAuth.test.ts`

- [ ] **Step 1: Instalar `jose`**

```bash
cd portifolio && npm install jose
```

- [ ] **Step 2: Escrever o teste**

```ts
// portifolio/api/_lib/auth/AdminAuth.test.ts
import { describe, expect, it } from "vitest";
import { AdminAuth } from "./AdminAuth";

const config = {
  adminPassword: "correct-horse-battery-staple",
  jwtSecret: "a-secret-that-is-long-enough-for-hs256",
  sessionDurationSeconds: 60 * 60 * 12,
};

describe("AdminAuth", () => {
  it("verifyPassword returns true for the correct password", () => {
    const auth = new AdminAuth(config);
    expect(auth.verifyPassword("correct-horse-battery-staple")).toBe(true);
  });

  it("verifyPassword returns false for an incorrect password", () => {
    const auth = new AdminAuth(config);
    expect(auth.verifyPassword("wrong-password")).toBe(false);
  });

  it("verifyPassword returns false for a password of different length", () => {
    const auth = new AdminAuth(config);
    expect(auth.verifyPassword("short")).toBe(false);
  });

  it("issueSessionToken produces a token that verifySessionToken accepts", async () => {
    const auth = new AdminAuth(config);
    const token = await auth.issueSessionToken();
    const valid = await auth.verifySessionToken(token);
    expect(valid).toBe(true);
  });

  it("verifySessionToken rejects a garbage token", async () => {
    const auth = new AdminAuth(config);
    const valid = await auth.verifySessionToken("not-a-real-token");
    expect(valid).toBe(false);
  });

  it("verifySessionToken rejects a token signed with a different secret", async () => {
    const auth = new AdminAuth(config);
    const otherAuth = new AdminAuth({ ...config, jwtSecret: "a-completely-different-secret-value" });
    const token = await otherAuth.issueSessionToken();
    const valid = await auth.verifySessionToken(token);
    expect(valid).toBe(false);
  });
});
```

- [ ] **Step 3: Rodar o teste e confirmar que falha**

```bash
cd portifolio && npx vitest run api/_lib/auth/AdminAuth.test.ts
```

Expected: FAIL — módulo não encontrado.

- [ ] **Step 4: Implementar `AdminAuth`**

```ts
// portifolio/api/_lib/auth/AdminAuth.ts
import { SignJWT, jwtVerify } from "jose";
import { timingSafeEqual } from "node:crypto";

export type AdminAuthConfig = {
  adminPassword: string;
  jwtSecret: string;
  sessionDurationSeconds: number;
};

/**
 * Comparação e emissão/verificação de sessão para o /admin. Não sabe nada
 * sobre HTTP, cookies ou requests — recebe e devolve apenas strings/booleans.
 */
export class AdminAuth {
  private readonly config: AdminAuthConfig;

  constructor(config: AdminAuthConfig) {
    this.config = config;
  }

  verifyPassword(candidate: string): boolean {
    const expected = Buffer.from(this.config.adminPassword, "utf-8");
    const actual = Buffer.from(candidate, "utf-8");
    if (expected.length !== actual.length) return false;
    return timingSafeEqual(expected, actual);
  }

  private secretKey(): Uint8Array {
    return new TextEncoder().encode(this.config.jwtSecret);
  }

  async issueSessionToken(): Promise<string> {
    return new SignJWT({ role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${this.config.sessionDurationSeconds}s`)
      .sign(this.secretKey());
  }

  async verifySessionToken(token: string): Promise<boolean> {
    try {
      const { payload } = await jwtVerify(token, this.secretKey());
      return payload.role === "admin";
    } catch {
      return false;
    }
  }
}
```

- [ ] **Step 5: Rodar o teste e confirmar que passa**

```bash
cd portifolio && npx vitest run api/_lib/auth/AdminAuth.test.ts
```

Expected: PASS — 6 testes.

- [ ] **Step 6: Commit**

```bash
git add portifolio/api/_lib/auth/AdminAuth.ts portifolio/api/_lib/auth/AdminAuth.test.ts portifolio/package.json portifolio/package-lock.json
git commit -m "feat: add AdminAuth for password check and JWT session issuance"
```

---

### Task 4: Rate limiter simples para o login

**Files:**
- Create: `portifolio/api/_lib/auth/LoginRateLimiter.ts`
- Test: `portifolio/api/_lib/auth/LoginRateLimiter.test.ts`

- [ ] **Step 1: Escrever o teste**

```ts
// portifolio/api/_lib/auth/LoginRateLimiter.test.ts
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { LoginRateLimiter } from "./LoginRateLimiter";

describe("LoginRateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-19T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows attempts under the limit", () => {
    const limiter = new LoginRateLimiter({ maxAttempts: 5, windowMs: 15 * 60 * 1000 });
    for (let i = 0; i < 5; i++) {
      expect(limiter.isBlocked("1.2.3.4")).toBe(false);
      limiter.recordFailedAttempt("1.2.3.4");
    }
  });

  it("blocks after exceeding the limit within the window", () => {
    const limiter = new LoginRateLimiter({ maxAttempts: 5, windowMs: 15 * 60 * 1000 });
    for (let i = 0; i < 5; i++) {
      limiter.recordFailedAttempt("1.2.3.4");
    }
    expect(limiter.isBlocked("1.2.3.4")).toBe(true);
  });

  it("does not block a different key", () => {
    const limiter = new LoginRateLimiter({ maxAttempts: 5, windowMs: 15 * 60 * 1000 });
    for (let i = 0; i < 5; i++) {
      limiter.recordFailedAttempt("1.2.3.4");
    }
    expect(limiter.isBlocked("5.6.7.8")).toBe(false);
  });

  it("resets the block after the window elapses", () => {
    const limiter = new LoginRateLimiter({ maxAttempts: 5, windowMs: 15 * 60 * 1000 });
    for (let i = 0; i < 5; i++) {
      limiter.recordFailedAttempt("1.2.3.4");
    }
    expect(limiter.isBlocked("1.2.3.4")).toBe(true);

    vi.setSystemTime(new Date("2026-07-19T12:16:00Z"));

    expect(limiter.isBlocked("1.2.3.4")).toBe(false);
  });

  it("clearAttempts removes the record for a key on successful login", () => {
    const limiter = new LoginRateLimiter({ maxAttempts: 5, windowMs: 15 * 60 * 1000 });
    for (let i = 0; i < 5; i++) {
      limiter.recordFailedAttempt("1.2.3.4");
    }
    limiter.clearAttempts("1.2.3.4");
    expect(limiter.isBlocked("1.2.3.4")).toBe(false);
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

```bash
cd portifolio && npx vitest run api/_lib/auth/LoginRateLimiter.test.ts
```

Expected: FAIL — módulo não encontrado.

- [ ] **Step 3: Implementar `LoginRateLimiter`**

```ts
// portifolio/api/_lib/auth/LoginRateLimiter.ts

export type LoginRateLimiterConfig = {
  maxAttempts: number;
  windowMs: number;
};

type AttemptRecord = {
  count: number;
  windowStart: number;
};

/**
 * Contador em memória por chave (tipicamente IP). Reinicia a cada cold
 * start da function — limitação conhecida e aceita dado o baixo tráfego
 * esperado nesta rota.
 */
export class LoginRateLimiter {
  private readonly attempts = new Map<string, AttemptRecord>();

  private readonly config: LoginRateLimiterConfig;

  constructor(config: LoginRateLimiterConfig) {
    this.config = config;
  }

  isBlocked(key: string): boolean {
    const record = this.attempts.get(key);
    if (!record) return false;

    if (Date.now() - record.windowStart >= this.config.windowMs) {
      this.attempts.delete(key);
      return false;
    }

    return record.count >= this.config.maxAttempts;
  }

  recordFailedAttempt(key: string): void {
    const record = this.attempts.get(key);
    const now = Date.now();

    if (!record || now - record.windowStart >= this.config.windowMs) {
      this.attempts.set(key, { count: 1, windowStart: now });
      return;
    }

    record.count += 1;
  }

  clearAttempts(key: string): void {
    this.attempts.delete(key);
  }
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

```bash
cd portifolio && npx vitest run api/_lib/auth/LoginRateLimiter.test.ts
```

Expected: PASS — 5 testes.

- [ ] **Step 5: Commit**

```bash
git add portifolio/api/_lib/auth/LoginRateLimiter.ts portifolio/api/_lib/auth/LoginRateLimiter.test.ts
git commit -m "feat: add in-memory LoginRateLimiter for admin login"
```

---

### Task 5: Tipos e validadores bilíngues por recurso

**Files:**
- Create: `portifolio/src/Types/LocalizedText.ts`
- Modify: `portifolio/src/Types/ExperienceType.ts`
- Modify: `portifolio/src/Types/cardType.ts`
- Modify: `portifolio/src/Types/ServiceType.ts`
- Modify: `portifolio/src/Types/userType.ts`
- Create: `portifolio/src/Types/SkillType.ts`
- Create: `portifolio/api/_lib/validation/validators.ts`
- Test: `portifolio/api/_lib/validation/validators.test.ts`

Esta task redefine os tipos de domínio para o formato bilíngue (`{ pt, en }`) e cria uma função de validação por recurso — a última linha de defesa antes de qualquer `replaceAll` no repositório.

- [ ] **Step 1: Criar o tipo `LocalizedText`**

```ts
// portifolio/src/Types/LocalizedText.ts
export type LocalizedText = {
  pt: string;
  en: string;
};
```

- [ ] **Step 2: Atualizar `ExperienceType.ts` para o formato bilíngue**

```ts
// portifolio/src/Types/ExperienceType.ts
import type { LocalizedText } from "./LocalizedText";

export interface ExperienceType {
  id: string;
  role: LocalizedText;
  company: LocalizedText;
  startDate: string;
  finalDate: string | null;
  description: LocalizedText;
  type: LocalizedText;
}
```

- [ ] **Step 3: Atualizar `cardType.ts` para o formato bilíngue**

```ts
// portifolio/src/Types/cardType.ts
import type { LocalizedText } from "./LocalizedText";

export type ProjectType = "Sites" | "Landing Pages" | "Aplicativos" | "E-Commerce" | "Outros" | string;

export interface CardType {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  languages: string[];
  type: string;
  status: LocalizedText;
  image?: string;
  video?: string;
  highlight?: boolean;
  date: string;
  siteLink?: string;
  gitHubLink?: string;
}
```

- [ ] **Step 4: Atualizar `ServiceType.ts` para o formato bilíngue**

```ts
// portifolio/src/Types/ServiceType.ts
import type { LocalizedText } from "./LocalizedText";

export interface ServiceItem {
  iconName: string;
  title: LocalizedText;
  description: LocalizedText;
}
```

Nota: o campo `icon: ElementType<SvgIconProps>` vira `iconName: string` — o componente React não pode ser serializado em JSON. A resolução de `iconName` para o componente MUI acontece no frontend (Task 8).

- [ ] **Step 5: Criar `SkillType.ts` (substitui o uso solto de `TechItem` como dado bruto)**

```ts
// portifolio/src/Types/SkillType.ts
export type SkillCategory =
  | "Frontend"
  | "Backend"
  | "Mobile"
  | "Database"
  | "DevOps"
  | "Testing"
  | "Design"
  | "Tools"
  | "Outros";

export interface SkillData {
  id: string;
  name: string;
  iconName: string;
  category: SkillCategory;
  color: string;
  bg: string;
  ariaLabel: string;
}
```

Nota: `TechItem` (`src/Types/techItem.ts`) continua existindo sem alteração — é o tipo consumido pelo componente visual `TechSkills`, que já resolve `icon` para um `ElementType`. `SkillData` é o formato bruto persistido em JSON; a Task 8 mapeia `SkillData` → `TechItem`.

- [ ] **Step 6: Atualizar `userType.ts` para separar dados fixos de dados editáveis**

```ts
// portifolio/src/Types/userType.ts
import type { LocalizedText } from "./LocalizedText";

export type User = {
  name: string;
  img?: string;
  desc: LocalizedText;
  emailName: string;
  linkedinName: string;
  githubName: string;
  links?: {
    github?: string;
    linkedin?: string;
    email?: string;
    whatsapp?: string;
  };
  telefone: string;
  curriculo: string;
  caracteristicas: LocalizedText[];
};
```

- [ ] **Step 7: Escrever os testes de validação**

```ts
// portifolio/api/_lib/validation/validators.test.ts
import { describe, expect, it } from "vitest";
import {
  validateExperience,
  validateProject,
  validateSkill,
  validateService,
  ValidationError,
} from "./validators";

describe("validateExperience", () => {
  const valid = {
    id: "exp-1",
    role: { pt: "Dev", en: "Dev" },
    company: { pt: "Empresa", en: "Company" },
    startDate: "01/2025",
    finalDate: null,
    description: { pt: "desc", en: "desc" },
    type: { pt: "Trabalho", en: "Work" },
  };

  it("accepts a well-formed experience", () => {
    expect(() => validateExperience(valid)).not.toThrow();
  });

  it("rejects a missing id", () => {
    const { id, ...rest } = valid;
    expect(() => validateExperience(rest)).toThrow(ValidationError);
  });

  it("rejects a role missing the english translation", () => {
    expect(() =>
      validateExperience({ ...valid, role: { pt: "Dev" } })
    ).toThrow(ValidationError);
  });

  it("rejects a startDate not in MM/YYYY format", () => {
    expect(() => validateExperience({ ...valid, startDate: "2025-01" })).toThrow(
      ValidationError
    );
  });

  it("accepts a null finalDate", () => {
    expect(() => validateExperience({ ...valid, finalDate: null })).not.toThrow();
  });
});

describe("validateProject", () => {
  const valid = {
    id: "proj-1",
    title: { pt: "Projeto", en: "Project" },
    description: { pt: "desc", en: "desc" },
    languages: ["React", "TypeScript"],
    type: "Sites",
    status: { pt: "Concluído", en: "Done" },
    date: "01/05/2023",
  };

  it("accepts a well-formed project", () => {
    expect(() => validateProject(valid)).not.toThrow();
  });

  it("rejects languages that is not an array of strings", () => {
    expect(() => validateProject({ ...valid, languages: "React" })).toThrow(
      ValidationError
    );
  });

  it("rejects a missing title", () => {
    const { title, ...rest } = valid;
    expect(() => validateProject(rest)).toThrow(ValidationError);
  });
});

describe("validateSkill", () => {
  const valid = {
    id: "skill-1",
    name: "React",
    iconName: "SiReact",
    category: "Frontend",
    color: "#61DAFB",
    bg: "#0B2C3C",
    ariaLabel: "React",
  };

  it("accepts a well-formed skill", () => {
    expect(() => validateSkill(valid)).not.toThrow();
  });

  it("rejects an unknown category", () => {
    expect(() => validateSkill({ ...valid, category: "Blockchain" })).toThrow(
      ValidationError
    );
  });
});

describe("validateService", () => {
  const valid = {
    iconName: "Language",
    title: { pt: "Sites", en: "Websites" },
    description: { pt: "desc", en: "desc" },
  };

  it("accepts a well-formed service", () => {
    expect(() => validateService(valid)).not.toThrow();
  });

  it("rejects a missing iconName", () => {
    const { iconName, ...rest } = valid;
    expect(() => validateService(rest)).toThrow(ValidationError);
  });
});
```

- [ ] **Step 8: Rodar os testes e confirmar que falham**

```bash
cd portifolio && npx vitest run api/_lib/validation/validators.test.ts
```

Expected: FAIL — módulo não encontrado.

- [ ] **Step 9: Implementar os validadores**

```ts
// portifolio/api/_lib/validation/validators.ts

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isLocalizedText(value: unknown): value is { pt: string; en: string } {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return isNonEmptyString(v.pt) && isNonEmptyString(v.en);
}

function requireLocalizedText(value: unknown, field: string): void {
  if (!isLocalizedText(value)) {
    throw new ValidationError(`${field} must be an object with non-empty "pt" and "en" strings`);
  }
}

function requireNonEmptyString(value: unknown, field: string): void {
  if (!isNonEmptyString(value)) {
    throw new ValidationError(`${field} must be a non-empty string`);
  }
}

const MONTH_YEAR_RE = /^(0[1-9]|1[0-2])\/\d{4}$/;

function requireMonthYear(value: unknown, field: string): void {
  if (typeof value !== "string" || !MONTH_YEAR_RE.test(value)) {
    throw new ValidationError(`${field} must be in MM/YYYY format`);
  }
}

export function validateExperience(data: unknown): void {
  if (typeof data !== "object" || data === null) {
    throw new ValidationError("experience must be an object");
  }
  const d = data as Record<string, unknown>;

  requireNonEmptyString(d.id, "id");
  requireLocalizedText(d.role, "role");
  requireLocalizedText(d.company, "company");
  requireMonthYear(d.startDate, "startDate");
  if (d.finalDate !== null) {
    requireMonthYear(d.finalDate, "finalDate");
  }
  requireLocalizedText(d.description, "description");
  requireLocalizedText(d.type, "type");
}

export function validateProject(data: unknown): void {
  if (typeof data !== "object" || data === null) {
    throw new ValidationError("project must be an object");
  }
  const d = data as Record<string, unknown>;

  requireNonEmptyString(d.id, "id");
  requireLocalizedText(d.title, "title");
  requireLocalizedText(d.description, "description");
  if (!Array.isArray(d.languages) || !d.languages.every((l) => typeof l === "string")) {
    throw new ValidationError("languages must be an array of strings");
  }
  requireNonEmptyString(d.type, "type");
  requireLocalizedText(d.status, "status");
  requireNonEmptyString(d.date, "date");
}

const VALID_SKILL_CATEGORIES = new Set([
  "Frontend",
  "Backend",
  "Mobile",
  "Database",
  "DevOps",
  "Testing",
  "Design",
  "Tools",
  "Outros",
]);

export function validateSkill(data: unknown): void {
  if (typeof data !== "object" || data === null) {
    throw new ValidationError("skill must be an object");
  }
  const d = data as Record<string, unknown>;

  requireNonEmptyString(d.id, "id");
  requireNonEmptyString(d.name, "name");
  requireNonEmptyString(d.iconName, "iconName");
  if (typeof d.category !== "string" || !VALID_SKILL_CATEGORIES.has(d.category)) {
    throw new ValidationError(`category must be one of ${[...VALID_SKILL_CATEGORIES].join(", ")}`);
  }
  requireNonEmptyString(d.color, "color");
  requireNonEmptyString(d.bg, "bg");
  requireNonEmptyString(d.ariaLabel, "ariaLabel");
}

export function validateService(data: unknown): void {
  if (typeof data !== "object" || data === null) {
    throw new ValidationError("service must be an object");
  }
  const d = data as Record<string, unknown>;

  requireNonEmptyString(d.iconName, "iconName");
  requireLocalizedText(d.title, "title");
  requireLocalizedText(d.description, "description");
}
```

- [ ] **Step 10: Rodar os testes e confirmar que passam**

```bash
cd portifolio && npx vitest run api/_lib/validation/validators.test.ts
```

Expected: PASS — 12 testes.

- [ ] **Step 11: Rodar o typecheck (os arquivos `.ts` de dados antigos ainda não foram migrados, então erros são esperados nos consumidores — serão corrigidos nas próximas tasks)**

```bash
cd portifolio && npx tsc -b --noEmit 2>&1 | head -50
```

Expected: erros apontando para `experienceData.ts`, `projects.ts`, `serviceData.ts`, `userData.ts`, `techData.ts` e os componentes que os consomem (`Experience.tsx`, `SkillsSection.tsx`, etc.) — esperado nesta task, resolvido nas Tasks 6-8.

- [ ] **Step 12: Commit**

```bash
git add portifolio/src/Types/LocalizedText.ts portifolio/src/Types/ExperienceType.ts portifolio/src/Types/cardType.ts portifolio/src/Types/ServiceType.ts portifolio/src/Types/SkillType.ts portifolio/src/Types/userType.ts portifolio/api/_lib/validation/validators.ts portifolio/api/_lib/validation/validators.test.ts
git commit -m "feat: define bilingual domain types and per-resource validators"
```

---

### Task 6: Migrar os dados existentes para JSON bilíngue

**Files:**
- Create: `portifolio/src/data/json/experiences.json`
- Create: `portifolio/src/data/json/projects.json`
- Create: `portifolio/src/data/json/skills.json`
- Create: `portifolio/src/data/json/services.json`
- Create: `portifolio/src/data/json/user.json`
- Delete: `portifolio/src/data/experienceData.ts`
- Delete: `portifolio/src/data/projects.ts`
- Delete: `portifolio/src/data/techData.ts`
- Delete: `portifolio/src/data/serviceData.ts`
- Delete: `portifolio/src/data/userData.ts`

Esta task converte manualmente o conteúdo atual (lido nas Tasks anteriores de exploração) para o novo formato, buscando as traduções em `src/locales/pt/translation.json` e `src/locales/en/translation.json`.

- [ ] **Step 1: Ler as chaves de tradução atuais para experiências, projetos e serviços**

```bash
cd portifolio && node -e "
const pt = require('./src/locales/pt/translation.json');
const en = require('./src/locales/en/translation.json');
console.log('PT experiencias:', JSON.stringify(pt.experiencias, null, 2));
console.log('EN experiencias:', JSON.stringify(en.experiencias, null, 2));
"
```

Anotar o resultado — será usado no Step 2. Repetir substituindo `experiencias` por `projects` e por `servicos` para obter os textos de projetos e serviços em ambos os idiomas.

- [ ] **Step 2: Criar `src/data/json/experiences.json`**

Usando os dados de `experienceData.ts` (datas, `id` sequencial) e as traduções obtidas no Step 1, criar o arquivo com todas as 8 experiências (atualmente `experiencia01` a `experiencia08` — usar os textos reais lidos, este é um exemplo do formato para as duas primeiras entradas):

```json
[
  {
    "id": "exp-08",
    "role": { "pt": "<texto de experiencias.experiencia08.papel em pt>", "en": "<texto em en>" },
    "company": { "pt": "<experiencias.experiencia08.empresa pt>", "en": "<en>" },
    "startDate": "01/2026",
    "finalDate": null,
    "description": { "pt": "<experiencias.experiencia08.descricao pt>", "en": "<en>" },
    "type": { "pt": "<experiencias.experiencia08.tipo pt>", "en": "<en>" }
  },
  {
    "id": "exp-07",
    "role": { "pt": "<experiencias.experiencia07.papel pt>", "en": "<en>" },
    "company": { "pt": "<experiencias.experiencia07.empresa pt>", "en": "<en>" },
    "startDate": "11/2025",
    "finalDate": "01/2026",
    "description": { "pt": "<experiencias.experiencia07.descricao pt>", "en": "<en>" },
    "type": { "pt": "<experiencias.experiencia07.tipo pt>", "en": "<en>" }
  }
]
```

Completar as 8 entradas seguindo a ordem e datas já presentes em `experienceData.ts` (lido anteriormente: experiencia08, 07, 01, 02, 03, 04, 05, 06, cada uma com seu `startDate`/`finalDate`), preenchendo `role`/`company`/`description`/`type` com os textos reais obtidos no Step 1.

- [ ] **Step 3: Criar `src/data/json/projects.json`**

Usando `projects.ts` (9 projetos, campos `id`, `languages`, `image`, `video`, `date`, `siteLink`, `gitHubLink`, `highlight`) e as traduções de `projects.*` obtidas no Step 1. O campo `type` deixa de ser uma chave de tradução (`"projects.types.sites"`) e vira uma string simples de categoria (`"Sites"`, `"Landing Pages"`, `"E-Commerce"`, `"Outros"`) — a tradução do rótulo do filtro continua vindo do `translation.json` de UI (chave fixa por categoria, não editável via admin). Exemplo para o primeiro projeto:

```json
[
  {
    "id": "8",
    "title": { "pt": "<projects.Ajunta.title pt>", "en": "<en>" },
    "description": { "pt": "<projects.Ajunta.description pt>", "en": "<en>" },
    "languages": ["Next.Js", "CSS3", "TypeScript", "GraphQL", "Golang", "PostgreSQL", "Aws", "Docker", "Python", "WebSocket", "API-Gateway", "Tailwind", "RabbitMQ", "Terraform"],
    "type": "Sites",
    "status": { "pt": "<projects.status.inProgress pt>", "en": "<en>" },
    "image": "/src/assets/projectsImages/login-ajunta.png",
    "date": "01/05/2023",
    "siteLink": "https://tinyurl.com/ajuntaa",
    "gitHubLink": "https://github.com/GuilhermeVieira05/pmg-es-2025-2-ti4-3170100-ajunta"
  }
]
```

Completar as 9 entradas (ids "8", "1" a "7", "9") preservando `languages`, `date`, `siteLink`, `gitHubLink`, `highlight` exatamente como estão em `projects.ts`, e mapeando `image`/`video` para o caminho do arquivo em `src/assets/...` correspondente (os componentes de exibição serão ajustados na Task 8 para resolver esse caminho via `new URL(..., import.meta.url)` ou import estático — ver nota no Step 5 desta task).

- [ ] **Step 4: Criar `src/data/json/skills.json`**

Usando `techData.ts` (36 skills), convertendo `icon: SiReact` (componente) para `iconName: "SiReact"` (string com o nome do export usado no import original) e adicionando um `id` derivado do nome em kebab-case. Exemplo para as duas primeiras:

```json
[
  {
    "id": "react",
    "name": "React",
    "iconName": "SiReact",
    "category": "Frontend",
    "color": "#61DAFB",
    "bg": "#0B2C3C",
    "ariaLabel": "React"
  },
  {
    "id": "nextjs",
    "name": "Next.js",
    "iconName": "SiNextdotjs",
    "category": "Frontend",
    "color": "#000000",
    "bg": "#EEEEEE",
    "ariaLabel": "Next.js"
  }
]
```

Completar todas as 36 entradas de `techData.ts`, preservando `name`, `color`, `bg`, `ariaLabel`, `category` exatamente, e usando o nome do ícone React (`SiReact`, `FaGolang`, `BiVector`, etc.) como `iconName`.

- [ ] **Step 5: Criar `src/data/json/services.json`**

Usando `serviceData.ts` (6 serviços) e as traduções de `servicos.*` obtidas no Step 1, convertendo `icon: Language` para `iconName: "Language"` (nome do export de `@mui/icons-material` usado):

```json
[
  {
    "iconName": "Language",
    "title": { "pt": "<servicos.sites.titulo pt>", "en": "<en>" },
    "description": { "pt": "<servicos.sites.descricao pt>", "en": "<en>" }
  },
  {
    "iconName": "RocketLaunch",
    "title": { "pt": "<servicos.landing.titulo pt>", "en": "<en>" },
    "description": { "pt": "<servicos.landing.descricao pt>", "en": "<en>" }
  }
]
```

Completar as 6 entradas (sites, landing, ecommerce, linkBio, manutencao, personalizado) usando os nomes de ícone já importados em `serviceData.ts`: `Language`, `RocketLaunch`, `ShoppingCart`, `LinkIcon` (exportado como `Link` do MUI — usar `"Link"` como `iconName`), `Build`, `Extension`.

- [ ] **Step 6: Criar `src/data/json/user.json`**

Usando `userData.ts` e a chave `user.desc`/`user.fullstack` etc. de `translation.json`:

```json
{
  "name": "Guilherme Vieira",
  "desc": { "pt": "<user.desc pt>", "en": "<en>" },
  "emailName": "guilhermearv3@gmail.com",
  "linkedinName": "guilherme-arvieira",
  "githubName": "GuilhermeVieira05",
  "links": {
    "github": "https://github.com/GuilhermeVieira05",
    "linkedin": "https://www.linkedin.com/in/guilherme-arvieira/",
    "email": "guilhermearv3@gmail.com"
  },
  "telefone": "+5531986991214",
  "caracteristicas": [
    { "pt": "<user.fullstack pt>", "en": "<en>" },
    { "pt": "<user.backend pt>", "en": "<en>" },
    { "pt": "<user.ai pt>", "en": "<en>" },
    { "pt": "<user.software pt>", "en": "<en>" }
  ]
}
```

Nota: `img` e `curriculo` (imports de asset local) ficam fora do JSON — continuam sendo resolvidos no componente via import estático de `profile.jpeg` e `curriculo.pdf`, já que são caminhos de build do Vite, não dados de conteúdo.

- [ ] **Step 7: Remover os arquivos `.ts` antigos**

```bash
cd portifolio && git rm src/data/experienceData.ts src/data/projects.ts src/data/techData.ts src/data/serviceData.ts src/data/userData.ts
```

- [ ] **Step 8: Remover as chaves `experiencias`, `projects`, `servicos` de ambos os arquivos de tradução**

Editar `portifolio/src/locales/pt/translation.json` e `portifolio/src/locales/en/translation.json`, removendo os blocos de nível superior `"experiencias": {...}`, `"projects": {...}` (mantendo `"projects.types.*"` e `"projects.status.*"` **apenas se** ainda forem usados como rótulos de filtro fixos — confirmar no Step 9 da Task 7 se `ProjectsSection.tsx` continua usando esses filtros por chave de tradução de UI) e `"servicos": {...}`, e `"user.desc"`, `"user.fullstack"`, `"user.backend"`, `"user.ai"`, `"user.software"` dentro do bloco `"user"`.

Este step será revisitado ao final da Task 7 — não apagar `projects.types.*`/`projects.status.*` nesta etapa, apenas os blocos de conteúdo (`experiencias`, os campos de cada projeto individual, `servicos`, `user.desc`/`user.fullstack`/etc.).

- [ ] **Step 9: Commit**

```bash
git add portifolio/src/data/json/ portifolio/src/locales/pt/translation.json portifolio/src/locales/en/translation.json
git add -u portifolio/src/data/
git commit -m "feat: migrate hardcoded experience/project/skill/service/user data to bilingual JSON"
```

---

### Task 7: Atualizar os componentes de exibição para ler dos novos JSONs

**Files:**
- Modify: `portifolio/src/components/Experience.tsx`
- Modify: `portifolio/src/components/sections/ProjectsSection.tsx`
- Modify: `portifolio/src/components/sections/ServicesSection.tsx`
- Modify: `portifolio/src/components/sections/SkillsSection.tsx`
- Modify: `portifolio/src/data/userData.ts` (recriado como composição de `user.json` + assets)
- Create: `portifolio/src/lib/iconRegistry.ts`
- Create: `portifolio/src/lib/localized.ts`

- [ ] **Step 1: Criar o helper `localized.ts`**

```ts
// portifolio/src/lib/localized.ts
import type { LocalizedText } from "../Types/LocalizedText";

export function localize(text: LocalizedText, language: string): string {
  return language === "pt" ? text.pt : text.en;
}
```

- [ ] **Step 2: Criar o `iconRegistry.ts` para skills e serviços**

```ts
// portifolio/src/lib/iconRegistry.ts
import type { ElementType } from "react";
import {
  SiReact, SiNextdotjs, SiTypescript, SiJavascript, SiNodedotjs, SiExpress,
  SiPrisma, SiPostgresql, SiMongodb, SiDocker, SiGit, SiGithub, SiTailwindcss,
  SiMui, SiFigma, SiVite, SiExpo, SiLinux, SiVercel, SiLangchain, SiPython,
  SiOpenai, SiGooglegemini, SiPhp, SiDjango, SiSpringboot, SiRabbitmq,
  SiPytest, SiNeo4J, SiTerraform, SiDart, SiFlutter,
} from "react-icons/si";
import { FaAws, FaGolang, FaJava } from "react-icons/fa6";
import { BiVector } from "react-icons/bi";
import {
  Language, RocketLaunch, ShoppingCart, Link, Build, Extension,
} from "@mui/icons-material";

export const skillIconRegistry: Record<string, ElementType> = {
  SiReact, SiNextdotjs, SiTypescript, SiJavascript, SiNodedotjs, SiExpress,
  SiPrisma, SiPostgresql, SiMongodb, SiDocker, SiGit, SiGithub, SiTailwindcss,
  SiMui, SiFigma, SiVite, SiExpo, SiLinux, SiVercel, SiLangchain, SiPython,
  SiOpenai, SiGooglegemini, SiPhp, SiDjango, SiSpringboot, SiRabbitmq,
  SiPytest, SiNeo4J, SiTerraform, SiDart, SiFlutter,
  FaAws, FaGolang, FaJava,
  BiVector,
};

export const serviceIconRegistry: Record<string, ElementType> = {
  Language, RocketLaunch, ShoppingCart, Link, Build, Extension,
};

export function resolveSkillIcon(iconName: string): ElementType {
  const icon = skillIconRegistry[iconName];
  if (!icon) throw new Error(`Unknown skill icon: ${iconName}`);
  return icon;
}

export function resolveServiceIcon(iconName: string): ElementType {
  const icon = serviceIconRegistry[iconName];
  if (!icon) throw new Error(`Unknown service icon: ${iconName}`);
  return icon;
}
```

- [ ] **Step 3: Atualizar `ExperienceSection`/`Experience.tsx` para ler o JSON e localizar os textos**

Em `portifolio/src/components/Experience.tsx`, substituir:

```tsx
import { experienceData } from '../data/experienceData.ts';
import { type ExperienceType } from "../Types/ExperienceType.js";
```

por:

```tsx
import experiencesJson from '../data/json/experiences.json';
import { type ExperienceType } from "../Types/ExperienceType.js";
import { localize } from '../lib/localized';
import i18n from '../i18n';
```

Substituir a linha `const dados: ExperienceType[] = experienceData;` por:

```tsx
  const dados: ExperienceType[] = experiencesJson as ExperienceType[];
```

Substituir todas as ocorrências de `t(item.role)` por `localize(item.role, i18n.language)`, `t(item.company)` por `localize(item.company, i18n.language)`, `t(item.description)` por `localize(item.description, i18n.language)`, e as três ocorrências de `t(item.type)` por `localize(item.type, i18n.language)`.

Manter o import `useTranslation` apenas se `t(...)` ainda for usado em outra parte do arquivo — não é o caso após esta mudança, então remover `import { useTranslation } from 'react-i18next';` e a linha `const { t } = useTranslation()`.

- [ ] **Step 4: Atualizar `ProjectsSection.tsx`**

Substituir:

```tsx
import { projects } from "../../data/projects";
```

por:

```tsx
import projectsJson from "../../data/json/projects.json";
import type { CardType } from "../../Types/cardType";
import { localize } from "../../lib/localized";
import i18n from "../../i18n";
```

Substituir a lista `FILTERS` (que hoje usa chaves de tradução `projects.types.*`) para filtrar pela nova propriedade `type` (string simples: `"Sites"`, `"Landing Pages"`, `"Aplicativos"`, `"E-Commerce"`, `"Outros"`):

```tsx
const FILTERS = ["Todos", "Sites", "Landing Pages", "Aplicativos", "E-Commerce", "Outros"] as const;

type FilterType = (typeof FILTERS)[number];

const FILTER_LABELS: Record<FilterType, { pt: string; en: string }> = {
  Todos: { pt: "Todos", en: "All" },
  Sites: { pt: "Sites", en: "Websites" },
  "Landing Pages": { pt: "Landing Pages", en: "Landing Pages" },
  Aplicativos: { pt: "Aplicativos", en: "Apps" },
  "E-Commerce": { pt: "E-Commerce", en: "E-Commerce" },
  Outros: { pt: "Outros", en: "Others" },
};
```

Substituir:

```tsx
  const [filter, setFilter] = useState<FilterType>("projetosSecao.filtros.all");
  const filteredProjects = useMemo(() => {
    if (filter === "projetosSecao.filtros.all") return projects;
    return projects.filter((p) => p.type === filter);
  }, [filter]);
```

por:

```tsx
  const projects = projectsJson as CardType[];
  const [filter, setFilter] = useState<FilterType>("Todos");
  const filteredProjects = useMemo(() => {
    if (filter === "Todos") return projects;
    return projects.filter((p) => p.type === filter);
  }, [filter, projects]);
```

No JSX do botão de filtro, substituir `{t(f)}` por `{localize(FILTER_LABELS[f], i18n.language)}`.

No card (`<ProjectCard project={p} />` e na mensagem de "nenhum projeto encontrado"), substituir `t(filter)` por `localize(FILTER_LABELS[filter], i18n.language)`.

Nota: `ProjectCard` (`src/components/Card.tsx`) e `ProjectModal.tsx` também consomem `CardType` — a Task 7 Step 7 abaixo cobre o ajuste deles.

- [ ] **Step 5: Atualizar `ServicesSection.tsx`**

Substituir:

```tsx
import { services } from "../../data/serviceData";
```

por:

```tsx
import servicesJson from "../../data/json/services.json";
import type { ServiceItem } from "../../Types/ServiceType";
import { resolveServiceIcon } from "../../lib/iconRegistry";
import { localize } from "../../lib/localized";
import i18n from "../../i18n";
```

Substituir `{services.map((service) => {` por:

```tsx
{(servicesJson as ServiceItem[]).map((service) => {
```

Substituir o corpo que resolve o ícone:

```tsx
            const Icon = service.icon as React.ElementType<SvgIconProps>;
```

por:

```tsx
            const Icon = resolveServiceIcon(service.iconName);
```

Substituir `{t(service.title)}` por `{localize(service.title, i18n.language)}` e `{t(service.description)}` por `{localize(service.description, i18n.language)}`.

Remover o import `import { useTranslation } from "react-i18next";` e a linha `const { t } = useTranslation()` se não sobrar nenhum outro uso de `t(...)` no arquivo (o título/subtítulo da seção, `t("servicosSecao.titulo")`, continua vindo de `translation.json` — então **manter** `useTranslation`).

- [ ] **Step 6: Atualizar `SkillsSection.tsx`**

Substituir:

```tsx
import { skills } from "../../data/techData";
```

por:

```tsx
import skillsJson from "../../data/json/skills.json";
import type { SkillData } from "../../Types/SkillType";
import { resolveSkillIcon } from "../../lib/iconRegistry";
```

Substituir a função `normalizedItems` (que mapeia `TechItem[]` para si mesmo normalizando categoria) para primeiro converter `SkillData[]` → `TechItem[]` resolvendo o ícone, depois normalizar:

```tsx
  const normalizedItems: TechItem[] = useMemo(() => {
    const skills = skillsJson as SkillData[];
    return skills.map((s) => ({
      name: s.name,
      icon: resolveSkillIcon(s.iconName),
      color: s.color,
      bg: s.bg,
      ariaLabel: s.ariaLabel,
      category: normalizeCategory(s.category) ?? "Outros",
    }));
  }, []);
```

O restante do arquivo (filtros por categoria, `TechSkills`) permanece inalterado, pois já opera sobre `TechItem[]`.

- [ ] **Step 7: Ajustar `Card.tsx` e `ProjectModal.tsx` para textos bilíngues**

Ler `portifolio/src/components/Card.tsx` e `portifolio/src/components/ProjectModal.tsx` primeiro para localizar exatamente onde `project.title`, `project.description`, `project.status` são renderizados (provavelmente como `{project.title}` direto, já que antes eram chaves resolvidas por `t()` no nível do array de dados — **confirmar isso lendo o arquivo**: se `Card.tsx` já chama `t(project.title)`, a mudança é trocar por `localize(project.title, i18n.language)`; se `Card.tsx` renderiza `project.title` cru assumindo que já é texto final, a mudança é a mesma). Em ambos os arquivos:

Adicionar os imports:

```tsx
import { localize } from "../lib/localized";
import i18n from "../i18n";
```

Substituir toda ocorrência de `project.title` usado como texto renderizado por `localize(project.title, i18n.language)`, `project.description` por `localize(project.description, i18n.language)`, e `project.status` por `localize(project.status, i18n.language)` (ajustando o caminho de import relativo conforme a profundidade do arquivo).

- [ ] **Step 8: Recriar `userData.ts` como composição de `user.json` + assets locais**

```ts
// portifolio/src/data/userData.ts
import type { User } from "../Types/userType";
import userJson from "./json/user.json";
import profileImg from "../assets/profile.jpeg";
import curriculo from "../assets/curriculo.pdf";

export const userData: User = {
  ...userJson,
  img: profileImg,
  curriculo,
};
```

- [ ] **Step 9: Atualizar os consumidores de `userData.caracteristicas` e `userData.desc` para localizar o texto**

Em `portifolio/src/pages/Home.tsx`, a linha:

```tsx
  const palavrasTraduzidas = user.caracteristicas.map((c) => t(c));
```

vira:

```tsx
  const palavrasTraduzidas = user.caracteristicas.map((c) => localize(c, i18n.language));
```

Adicionar o import `import { localize } from "../lib/localized";` em `Home.tsx`.

Buscar outros usos de `userData.desc` no projeto:

```bash
grep -rn "userData.desc\|user.desc" portifolio/src --include="*.tsx"
```

Para cada ocorrência encontrada que renderiza o valor como texto (não como chave de `t()`), aplicar o mesmo padrão: `localize(userData.desc, i18n.language)`.

- [ ] **Step 10: Remover as chaves de filtro de projeto órfãs, se aplicável**

Como `ProjectsSection.tsx` agora usa `FILTER_LABELS` local em vez de `t("projects.types.*")`, remover de `translation.json` (pt e en) as chaves `projects.types.*` e `projects.status.*` que sobraram do Step 8 da Task 6 (elas não são mais referenciadas em lugar nenhum). Confirmar antes de remover:

```bash
grep -rn "projects.types\.\|projects.status\." portifolio/src --include="*.tsx"
```

Expected: nenhum resultado (confirma que é seguro remover essas chaves dos dois `translation.json`).

- [ ] **Step 11: Rodar o typecheck**

```bash
cd portifolio && npx tsc -b --noEmit
```

Expected: sem erros. Resolver qualquer erro remanescente de tipo antes de prosseguir (ex: imports não usados, `SvgIconProps` não utilizado em `ServicesSection.tsx` após a Task).

- [ ] **Step 12: Rodar o build**

```bash
cd portifolio && npm run build
```

Expected: build conclui sem erros.

- [ ] **Step 13: Testar manualmente**

```bash
cd portifolio && npm run dev
```

Visitar `/`, `/habilidades`, `/projetos`, `/sobre` e confirmar visualmente que experiências, skills, projetos e serviços aparecem exatamente como antes, em pt e en (trocar idioma no seletor).

- [ ] **Step 14: Commit**

```bash
git add portifolio/src
git commit -m "feat: read experiences/projects/skills/services/user from bilingual JSON at build time"
```

---

### Task 8: API routes `/api/admin/login` e `/api/admin/logout`

**Files:**
- Create: `portifolio/api/admin/login.ts`
- Create: `portifolio/api/admin/logout.ts`
- Create: `portifolio/api/_lib/env.ts`

- [ ] **Step 1: Criar `env.ts` — leitura centralizada das variáveis de ambiente**

```ts
// portifolio/api/_lib/env.ts

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
```

- [ ] **Step 2: Criar `api/admin/login.ts`**

```ts
// portifolio/api/admin/login.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { AdminAuth } from "../_lib/auth/AdminAuth";
import { LoginRateLimiter } from "../_lib/auth/LoginRateLimiter";
import { getAdminEnv, SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS } from "../_lib/env";

const rateLimiter = new LoginRateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
});

function clientKey(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress ?? "unknown";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const key = clientKey(req);
  if (rateLimiter.isBlocked(key)) {
    res.status(429).json({ error: "Too many attempts. Try again later." });
    return;
  }

  const { password } = req.body ?? {};
  if (typeof password !== "string") {
    res.status(400).json({ error: "Missing password" });
    return;
  }

  const env = getAdminEnv();
  const auth = new AdminAuth({
    adminPassword: env.adminPassword,
    jwtSecret: env.jwtSecret,
    sessionDurationSeconds: SESSION_DURATION_SECONDS,
  });

  if (!auth.verifyPassword(password)) {
    rateLimiter.recordFailedAttempt(key);
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  rateLimiter.clearAttempts(key);
  const token = await auth.issueSessionToken();

  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_DURATION_SECONDS}; Path=/`
  );
  res.status(200).json({ ok: true });
}
```

- [ ] **Step 3: Criar `api/admin/logout.ts`**

```ts
// portifolio/api/admin/logout.ts
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
```

- [ ] **Step 4: Rodar o typecheck**

```bash
cd portifolio && npx tsc -b --noEmit
```

Expected: sem erros.

- [ ] **Step 5: Commit**

```bash
git add portifolio/api/admin/login.ts portifolio/api/admin/logout.ts portifolio/api/_lib/env.ts
git commit -m "feat: add /api/admin/login and /api/admin/logout routes"
```

---

### Task 9: Middleware de autorização e API route genérica `/api/admin/data/[resource]`

**Files:**
- Create: `portifolio/api/_lib/auth/requireAdminSession.ts`
- Test: `portifolio/api/_lib/auth/requireAdminSession.test.ts`
- Create: `portifolio/api/_lib/data/resourceRegistry.ts`
- Create: `portifolio/api/admin/data/[resource].ts`

- [ ] **Step 1: Escrever o teste do middleware**

```ts
// portifolio/api/_lib/auth/requireAdminSession.test.ts
import { describe, expect, it, vi } from "vitest";
import { requireAdminSession } from "./requireAdminSession";
import type { AdminAuth } from "./AdminAuth";
import { SESSION_COOKIE_NAME } from "../env";

function fakeReq(cookieHeader?: string) {
  return { headers: { cookie: cookieHeader } } as any;
}

describe("requireAdminSession", () => {
  it("returns true when the session cookie is present and valid", async () => {
    const auth = { verifySessionToken: vi.fn().mockResolvedValue(true) } as unknown as AdminAuth;
    const req = fakeReq(`${SESSION_COOKIE_NAME}=valid-token`);

    const result = await requireAdminSession(req, auth);

    expect(result).toBe(true);
    expect(auth.verifySessionToken).toHaveBeenCalledWith("valid-token");
  });

  it("returns false when there is no cookie header", async () => {
    const auth = { verifySessionToken: vi.fn() } as unknown as AdminAuth;
    const req = fakeReq(undefined);

    const result = await requireAdminSession(req, auth);

    expect(result).toBe(false);
    expect(auth.verifySessionToken).not.toHaveBeenCalled();
  });

  it("returns false when the session cookie is invalid", async () => {
    const auth = { verifySessionToken: vi.fn().mockResolvedValue(false) } as unknown as AdminAuth;
    const req = fakeReq(`${SESSION_COOKIE_NAME}=garbage`);

    const result = await requireAdminSession(req, auth);

    expect(result).toBe(false);
  });

  it("returns false when the cookie header has other cookies but not the session one", async () => {
    const auth = { verifySessionToken: vi.fn() } as unknown as AdminAuth;
    const req = fakeReq("some_other_cookie=abc");

    const result = await requireAdminSession(req, auth);

    expect(result).toBe(false);
    expect(auth.verifySessionToken).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

```bash
cd portifolio && npx vitest run api/_lib/auth/requireAdminSession.test.ts
```

Expected: FAIL — módulo não encontrado.

- [ ] **Step 3: Implementar `requireAdminSession`**

```ts
// portifolio/api/_lib/auth/requireAdminSession.ts
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
```

- [ ] **Step 4: Rodar e confirmar que passa**

```bash
cd portifolio && npx vitest run api/_lib/auth/requireAdminSession.test.ts
```

Expected: PASS — 4 testes.

- [ ] **Step 5: Criar o registro de recursos (`resourceRegistry.ts`)**

Este módulo mapeia o nome do recurso (vindo da URL `/api/admin/data/:resource`) para o caminho do arquivo JSON e o validador correspondente — o único lugar que precisa mudar ao adicionar um novo tipo de recurso editável no futuro (Open/Closed: adicionar uma entrada aqui, sem tocar na rota).

```ts
// portifolio/api/_lib/data/resourceRegistry.ts
import { validateExperience, validateProject, validateSkill, validateService } from "../validation/validators";

export type ResourceName = "experiences" | "projects" | "skills" | "services";

type ResourceDefinition = {
  path: string;
  validateItem: (item: unknown) => void;
};

export const RESOURCE_REGISTRY: Record<ResourceName, ResourceDefinition> = {
  experiences: {
    path: "portifolio/src/data/json/experiences.json",
    validateItem: validateExperience,
  },
  projects: {
    path: "portifolio/src/data/json/projects.json",
    validateItem: validateProject,
  },
  skills: {
    path: "portifolio/src/data/json/skills.json",
    validateItem: validateSkill,
  },
  services: {
    path: "portifolio/src/data/json/services.json",
    validateItem: validateService,
  },
};

export function isResourceName(value: string): value is ResourceName {
  return value in RESOURCE_REGISTRY;
}
```

Nota: `user` (objeto único, não array) é tratado por uma rota dedicada na Task 10, não por este registro genérico de listas.

- [ ] **Step 6: Criar a API route dinâmica `[resource].ts`**

```ts
// portifolio/api/admin/data/[resource].ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { AdminAuth } from "../../_lib/auth/AdminAuth";
import { requireAdminSession } from "../../_lib/auth/requireAdminSession";
import { GitHubContentClient } from "../../_lib/github/GitHubContentClient";
import { JsonResourceRepository } from "../../_lib/data/JsonResourceRepository";
import { RESOURCE_REGISTRY, isResourceName } from "../../_lib/data/resourceRegistry";
import { ValidationError } from "../../_lib/validation/validators";
import { getAdminEnv, SESSION_DURATION_SECONDS } from "../../_lib/env";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const env = getAdminEnv();
  const auth = new AdminAuth({
    adminPassword: env.adminPassword,
    jwtSecret: env.jwtSecret,
    sessionDurationSeconds: SESSION_DURATION_SECONDS,
  });

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
  const client = new GitHubContentClient({
    owner: env.githubOwner,
    repo: env.githubRepo,
    token: env.githubToken,
    branch: env.githubBranch,
  });
  const repository = new JsonResourceRepository<unknown>(client, definition.path);

  if (req.method === "GET") {
    const items = await repository.list();
    res.status(200).json({ items });
    return;
  }

  if (req.method === "PUT") {
    const items = req.body?.items;
    if (!Array.isArray(items)) {
      res.status(400).json({ error: "Body must be { items: [...] }" });
      return;
    }

    try {
      items.forEach(definition.validateItem);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
        return;
      }
      throw error;
    }

    await repository.replaceAll(items, `chore: update ${resource} via admin`);
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
```

- [ ] **Step 7: Rodar o typecheck**

```bash
cd portifolio && npx tsc -b --noEmit
```

Expected: sem erros.

- [ ] **Step 8: Commit**

```bash
git add portifolio/api/_lib/auth/requireAdminSession.ts portifolio/api/_lib/auth/requireAdminSession.test.ts portifolio/api/_lib/data/resourceRegistry.ts portifolio/api/admin/data/
git commit -m "feat: add authenticated /api/admin/data/[resource] CRUD route"
```

---

### Task 10: API routes para `user` e upload de currículo

**Files:**
- Create: `portifolio/api/admin/data/user.ts`
- Create: `portifolio/api/admin/upload-resume.ts`

Como `user.json` é um objeto único (não uma lista), tem uma rota própria em vez de passar pelo `resourceRegistry` genérico de arrays.

- [ ] **Step 1: Criar `api/admin/data/user.ts`**

```ts
// portifolio/api/admin/data/user.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { AdminAuth } from "../../_lib/auth/AdminAuth";
import { requireAdminSession } from "../../_lib/auth/requireAdminSession";
import { GitHubContentClient } from "../../_lib/github/GitHubContentClient";
import { getAdminEnv, SESSION_DURATION_SECONDS } from "../../_lib/env";

const USER_JSON_PATH = "portifolio/src/data/json/user.json";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateUser(data: unknown): string | null {
  if (typeof data !== "object" || data === null) return "user must be an object";
  const d = data as Record<string, unknown>;
  if (!isNonEmptyString(d.name)) return "name must be a non-empty string";
  if (!isNonEmptyString(d.emailName)) return "emailName must be a non-empty string";
  if (!isNonEmptyString(d.telefone)) return "telefone must be a non-empty string";
  if (!Array.isArray(d.caracteristicas)) return "caracteristicas must be an array";
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const env = getAdminEnv();
  const auth = new AdminAuth({
    adminPassword: env.adminPassword,
    jwtSecret: env.jwtSecret,
    sessionDurationSeconds: SESSION_DURATION_SECONDS,
  });

  if (!(await requireAdminSession(req, auth))) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const client = new GitHubContentClient({
    owner: env.githubOwner,
    repo: env.githubRepo,
    token: env.githubToken,
    branch: env.githubBranch,
  });

  if (req.method === "GET") {
    const file = await client.readFile(USER_JSON_PATH);
    res.status(200).json({ user: file ? JSON.parse(file.content) : null });
    return;
  }

  if (req.method === "PUT") {
    const error = validateUser(req.body);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    const current = await client.readFile(USER_JSON_PATH);
    await client.writeFile({
      path: USER_JSON_PATH,
      content: JSON.stringify(req.body, null, 2) + "\n",
      message: "chore: update user data via admin",
      sha: current?.sha,
    });
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
```

- [ ] **Step 2: Criar `api/admin/upload-resume.ts`**

```ts
// portifolio/api/admin/upload-resume.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { AdminAuth } from "../_lib/auth/AdminAuth";
import { requireAdminSession } from "../_lib/auth/requireAdminSession";
import { GitHubContentClient } from "../_lib/github/GitHubContentClient";
import { getAdminEnv, SESSION_DURATION_SECONDS } from "../_lib/env";

const RESUME_PATH = "portifolio/src/assets/curriculo.pdf";
const MAX_BASE64_LENGTH = 10 * 1024 * 1024; // ~7.5MB de PDF decodificado

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const env = getAdminEnv();
  const auth = new AdminAuth({
    adminPassword: env.adminPassword,
    jwtSecret: env.jwtSecret,
    sessionDurationSeconds: SESSION_DURATION_SECONDS,
  });

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

  const client = new GitHubContentClient({
    owner: env.githubOwner,
    repo: env.githubRepo,
    token: env.githubToken,
    branch: env.githubBranch,
  });

  const current = await client.readFile(RESUME_PATH);
  await client.writeFile({
    path: RESUME_PATH,
    content: Buffer.from(fileBase64, "base64").toString("binary"),
    message: "chore: update resume via admin",
    sha: current?.sha,
  });

  res.status(200).json({ ok: true });
}
```

Nota: `GitHubContentClient.writeFile` faz `Buffer.from(params.content, "utf-8").toString("base64")` — para binário isso exige que `content` já seja uma string "binary" (latin1), que reencodada em base64 preserva os bytes originais do PDF corretamente.

- [ ] **Step 3: Rodar o typecheck**

```bash
cd portifolio && npx tsc -b --noEmit
```

Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add portifolio/api/admin/data/user.ts portifolio/api/admin/upload-resume.ts
git commit -m "feat: add /api/admin/data/user and /api/admin/upload-resume routes"
```

---

### Task 11: Frontend — página de login `/admin/login`

**Files:**
- Create: `portifolio/src/pages/admin/AdminLogin.tsx`
- Create: `portifolio/src/api/adminApi.ts`
- Modify: `portifolio/src/App.tsx`

- [ ] **Step 1: Criar `adminApi.ts` — cliente HTTP do frontend para as rotas /api/admin**

```ts
// portifolio/src/api/adminApi.ts

export class AdminApiError extends Error {}

async function parseJsonOrThrow(response: Response): Promise<any> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new AdminApiError(data.error ?? `HTTP ${response.status}`);
  }
  return data;
}

export async function login(password: string): Promise<void> {
  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ password }),
  });
  await parseJsonOrThrow(response);
}

export async function logout(): Promise<void> {
  const response = await fetch("/api/admin/logout", {
    method: "POST",
    credentials: "include",
  });
  await parseJsonOrThrow(response);
}

export async function fetchResource<T>(resource: string): Promise<T[]> {
  const response = await fetch(`/api/admin/data/${resource}`, {
    credentials: "include",
  });
  const data = await parseJsonOrThrow(response);
  return data.items as T[];
}

export async function saveResource<T>(resource: string, items: T[]): Promise<void> {
  const response = await fetch(`/api/admin/data/${resource}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ items }),
  });
  await parseJsonOrThrow(response);
}

export async function fetchUser<T>(): Promise<T | null> {
  const response = await fetch("/api/admin/data/user", { credentials: "include" });
  const data = await parseJsonOrThrow(response);
  return data.user as T | null;
}

export async function saveUser<T>(user: T): Promise<void> {
  const response = await fetch("/api/admin/data/user", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(user),
  });
  await parseJsonOrThrow(response);
}

export async function uploadResume(fileBase64: string): Promise<void> {
  const response = await fetch("/api/admin/upload-resume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ fileBase64 }),
  });
  await parseJsonOrThrow(response);
}
```

- [ ] **Step 2: Criar `AdminLogin.tsx`**

```tsx
// portifolio/src/pages/admin/AdminLogin.tsx
import React, { useState } from "react";
import { Box, Button, Container, TextField, Typography, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { login, AdminApiError } from "../../api/adminApi";

export const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(password);
      navigate("/admin");
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", bgcolor: "#2c2c2c" }}>
      <Container maxWidth="xs">
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h5" sx={{ color: "#fff" }}>Admin</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            type="password"
            label="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            fullWidth
            sx={{ bgcolor: "#fff", borderRadius: 1 }}
          />
          <Button type="submit" variant="contained" disabled={loading || password.length === 0}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};
```

- [ ] **Step 3: Registrar a rota `/admin/login` em `App.tsx`**

Em `portifolio/src/App.tsx`, adicionar o import:

```tsx
import { AdminLogin } from "./pages/admin/AdminLogin";
```

E adicionar dentro de `<Routes>`:

```tsx
            <Route path="/admin/login" element={<AdminLogin />} />
```

- [ ] **Step 4: Rodar o typecheck e o build**

```bash
cd portifolio && npx tsc -b --noEmit && npm run build
```

Expected: sem erros.

- [ ] **Step 5: Testar manualmente**

```bash
cd portifolio && npm run dev
```

Visitar `http://localhost:5173/admin/login`. Sem as env vars configuradas localmente (`ADMIN_PASSWORD` etc.), o submit vai falhar contra a function real — isso é esperado nesta task; o teste completo de ponta a ponta acontece na Task 13 após configurar `.env.local` com Vercel dev, ou em produção. Confirmar aqui apenas que a tela renderiza e o formulário mostra erro de forma amigável ao falhar.

- [ ] **Step 6: Commit**

```bash
git add portifolio/src/pages/admin/AdminLogin.tsx portifolio/src/api/adminApi.ts portifolio/src/App.tsx
git commit -m "feat: add admin login page and adminApi client"
```

---

### Task 12: Frontend — dashboard `/admin` e hook `useAdminResource`

**Files:**
- Create: `portifolio/src/pages/admin/AdminDashboard.tsx`
- Create: `portifolio/src/pages/admin/hooks/useAdminResource.ts`
- Create: `portifolio/src/pages/admin/AdminRoute.tsx`
- Modify: `portifolio/src/App.tsx`

- [ ] **Step 1: Criar o hook `useAdminResource`**

Encapsula fetch/save/loading/error para uma lista de itens — reaproveitado por todas as telas de CRUD da Task 13, sem duplicar lógica de estado.

```ts
// portifolio/src/pages/admin/hooks/useAdminResource.ts
import { useCallback, useEffect, useState } from "react";
import { fetchResource, saveResource, AdminApiError } from "../../../api/adminApi";

export function useAdminResource<T>(resource: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchResource<T>(resource);
      setItems(data);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(
    async (nextItems: T[]) => {
      setSaving(true);
      setError(null);
      try {
        await saveResource(resource, nextItems);
        setItems(nextItems);
      } catch (err) {
        setError(err instanceof AdminApiError ? err.message : "Erro ao salvar dados");
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [resource]
  );

  return { items, loading, saving, error, save, reload: load };
}
```

- [ ] **Step 2: Criar `AdminRoute.tsx` — guarda de rota client-side**

```tsx
// portifolio/src/pages/admin/AdminRoute.tsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { fetchUser } from "../../api/adminApi";

type Props = { children: React.ReactNode };

export const AdminRoute: React.FC<Props> = ({ children }) => {
  const [status, setStatus] = useState<"checking" | "authenticated" | "unauthenticated">("checking");

  useEffect(() => {
    fetchUser()
      .then(() => setStatus("authenticated"))
      .catch(() => setStatus("unauthenticated"));
  }, []);

  if (status === "checking") return null;
  if (status === "unauthenticated") return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};
```

Nota: reutiliza `GET /api/admin/data/user` como "ping autenticado" — se o cookie for inválido, a rota retorna 401 e `fetchUser` rejeita.

- [ ] **Step 3: Criar `AdminDashboard.tsx`**

```tsx
// portifolio/src/pages/admin/AdminDashboard.tsx
import React from "react";
import { Box, Container, Typography, Card, CardActionArea, CardContent, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { logout } from "../../api/adminApi";

const SECTIONS = [
  { key: "experiences", label: "Experiências" },
  { key: "projects", label: "Projetos" },
  { key: "skills", label: "Skills" },
  { key: "services", label: "Serviços" },
  { key: "user", label: "Dados pessoais e currículo" },
];

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#2c2c2c", py: 6 }}>
      <Container maxWidth="md">
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Typography variant="h4" sx={{ color: "#fff" }}>Admin</Typography>
          <Button
            variant="outlined"
            onClick={async () => {
              await logout();
              navigate("/admin/login");
            }}
          >
            Sair
          </Button>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          {SECTIONS.map((section) => (
            <Card key={section.key}>
              <CardActionArea onClick={() => navigate(`/admin/${section.key}`)}>
                <CardContent>
                  <Typography variant="h6">{section.label}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
};
```

- [ ] **Step 4: Registrar `/admin` protegido em `App.tsx`**

Adicionar os imports:

```tsx
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminRoute } from "./pages/admin/AdminRoute";
```

Adicionar dentro de `<Routes>`:

```tsx
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
```

- [ ] **Step 5: Rodar o typecheck e o build**

```bash
cd portifolio && npx tsc -b --noEmit && npm run build
```

Expected: sem erros.

- [ ] **Step 6: Commit**

```bash
git add portifolio/src/pages/admin/AdminDashboard.tsx portifolio/src/pages/admin/hooks/useAdminResource.ts portifolio/src/pages/admin/AdminRoute.tsx portifolio/src/App.tsx
git commit -m "feat: add protected /admin dashboard with useAdminResource hook"
```

---

### Task 13: Frontend — telas de CRUD por recurso

**Files:**
- Create: `portifolio/src/pages/admin/ExperiencesAdmin.tsx`
- Create: `portifolio/src/pages/admin/ProjectsAdmin.tsx`
- Create: `portifolio/src/pages/admin/SkillsAdmin.tsx`
- Create: `portifolio/src/pages/admin/ServicesAdmin.tsx`
- Create: `portifolio/src/pages/admin/UserAdmin.tsx`
- Create: `portifolio/src/pages/admin/components/LocalizedTextField.tsx`
- Modify: `portifolio/src/App.tsx`

- [ ] **Step 1: Criar `LocalizedTextField.tsx` — campo PT/EN reaproveitado em todos os formulários**

```tsx
// portifolio/src/pages/admin/components/LocalizedTextField.tsx
import React from "react";
import { Box, TextField } from "@mui/material";
import type { LocalizedText } from "../../../Types/LocalizedText";

type Props = {
  label: string;
  value: LocalizedText;
  onChange: (next: LocalizedText) => void;
  multiline?: boolean;
};

export const LocalizedTextField: React.FC<Props> = ({ label, value, onChange, multiline }) => (
  <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
    <TextField
      label={`${label} (PT)`}
      value={value.pt}
      onChange={(e) => onChange({ ...value, pt: e.target.value })}
      multiline={multiline}
      minRows={multiline ? 3 : undefined}
      fullWidth
    />
    <TextField
      label={`${label} (EN)`}
      value={value.en}
      onChange={(e) => onChange({ ...value, en: e.target.value })}
      multiline={multiline}
      minRows={multiline ? 3 : undefined}
      fullWidth
    />
  </Box>
);
```

- [ ] **Step 2: Criar `ExperiencesAdmin.tsx`**

```tsx
// portifolio/src/pages/admin/ExperiencesAdmin.tsx
import React, { useState } from "react";
import { Box, Container, Typography, Button, TextField, MenuItem, IconButton, Paper } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAdminResource } from "./hooks/useAdminResource";
import { LocalizedTextField } from "./components/LocalizedTextField";
import type { ExperienceType } from "../../Types/ExperienceType";

const EMPTY: ExperienceType = {
  id: "",
  role: { pt: "", en: "" },
  company: { pt: "", en: "" },
  startDate: "",
  finalDate: null,
  description: { pt: "", en: "" },
  type: { pt: "Trabalho", en: "Work" },
};

export const ExperiencesAdmin: React.FC = () => {
  const { items, loading, saving, error, save } = useAdminResource<ExperienceType>("experiences");
  const [draft, setDraft] = useState<ExperienceType[]>([]);

  React.useEffect(() => {
    setDraft(items);
  }, [items]);

  const updateItem = (index: number, next: ExperienceType) => {
    setDraft((prev) => prev.map((item, i) => (i === index ? next : item)));
  };

  const removeItem = (index: number) => {
    setDraft((prev) => prev.filter((_, i) => i !== index));
  };

  const addItem = () => {
    setDraft((prev) => [...prev, { ...EMPTY, id: `exp-${Date.now()}` }]);
  };

  if (loading) return <Container sx={{ py: 4 }}>Carregando...</Container>;

  return (
    <Container sx={{ py: 4, display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h4">Experiências</Typography>
      {error && <Typography color="error">{error}</Typography>}

      {draft.map((item, index) => (
        <Paper key={item.id || index} sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="subtitle1">{item.id || "(novo)"}</Typography>
            <IconButton onClick={() => removeItem(index)} aria-label="remover">
              <DeleteIcon />
            </IconButton>
          </Box>
          <LocalizedTextField label="Cargo" value={item.role} onChange={(v) => updateItem(index, { ...item, role: v })} />
          <LocalizedTextField label="Empresa" value={item.company} onChange={(v) => updateItem(index, { ...item, company: v })} />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Início (MM/AAAA)"
              value={item.startDate}
              onChange={(e) => updateItem(index, { ...item, startDate: e.target.value })}
            />
            <TextField
              label="Fim (MM/AAAA, vazio = atual)"
              value={item.finalDate ?? ""}
              onChange={(e) => updateItem(index, { ...item, finalDate: e.target.value || null })}
            />
          </Box>
          <LocalizedTextField
            label="Descrição"
            value={item.description}
            onChange={(v) => updateItem(index, { ...item, description: v })}
            multiline
          />
          <LocalizedTextField
            label="Tipo (Trabalho/Estudo/Voluntariado)"
            value={item.type}
            onChange={(v) => updateItem(index, { ...item, type: v })}
          />
        </Paper>
      ))}

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="outlined" onClick={addItem}>Adicionar experiência</Button>
        <Button variant="contained" disabled={saving} onClick={() => save(draft)}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </Box>
    </Container>
  );
};
```

- [ ] **Step 3: Criar `ServicesAdmin.tsx`**

```tsx
// portifolio/src/pages/admin/ServicesAdmin.tsx
import React, { useEffect, useState } from "react";
import { Box, Container, Typography, Button, TextField, IconButton, Paper } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAdminResource } from "./hooks/useAdminResource";
import { LocalizedTextField } from "./components/LocalizedTextField";
import type { ServiceItem } from "../../Types/ServiceType";
import { serviceIconRegistry } from "../../lib/iconRegistry";

const EMPTY: ServiceItem = { iconName: "Language", title: { pt: "", en: "" }, description: { pt: "", en: "" } };

export const ServicesAdmin: React.FC = () => {
  const { items, loading, saving, error, save } = useAdminResource<ServiceItem>("services");
  const [draft, setDraft] = useState<ServiceItem[]>([]);

  useEffect(() => setDraft(items), [items]);

  const updateItem = (index: number, next: ServiceItem) => {
    setDraft((prev) => prev.map((item, i) => (i === index ? next : item)));
  };
  const removeItem = (index: number) => setDraft((prev) => prev.filter((_, i) => i !== index));
  const addItem = () => setDraft((prev) => [...prev, EMPTY]);

  if (loading) return <Container sx={{ py: 4 }}>Carregando...</Container>;

  return (
    <Container sx={{ py: 4, display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h4">Serviços</Typography>
      {error && <Typography color="error">{error}</Typography>}

      {draft.map((item, index) => (
        <Paper key={index} sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <TextField
              select
              label="Ícone"
              value={item.iconName}
              onChange={(e) => updateItem(index, { ...item, iconName: e.target.value })}
              SelectProps={{ native: true }}
              sx={{ minWidth: 200 }}
            >
              {Object.keys(serviceIconRegistry).map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </TextField>
            <IconButton onClick={() => removeItem(index)} aria-label="remover">
              <DeleteIcon />
            </IconButton>
          </Box>
          <LocalizedTextField label="Título" value={item.title} onChange={(v) => updateItem(index, { ...item, title: v })} />
          <LocalizedTextField label="Descrição" value={item.description} onChange={(v) => updateItem(index, { ...item, description: v })} multiline />
        </Paper>
      ))}

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="outlined" onClick={addItem}>Adicionar serviço</Button>
        <Button variant="contained" disabled={saving} onClick={() => save(draft)}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </Box>
    </Container>
  );
};
```

- [ ] **Step 4: Criar `SkillsAdmin.tsx`**

```tsx
// portifolio/src/pages/admin/SkillsAdmin.tsx
import React, { useEffect, useState } from "react";
import { Box, Container, Typography, Button, TextField, MenuItem, IconButton, Paper } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAdminResource } from "./hooks/useAdminResource";
import type { SkillData, SkillCategory } from "../../Types/SkillType";
import { skillIconRegistry } from "../../lib/iconRegistry";

const CATEGORIES: SkillCategory[] = ["Frontend", "Backend", "Mobile", "Database", "DevOps", "Testing", "Design", "Tools", "Outros"];

const EMPTY: SkillData = { id: "", name: "", iconName: "SiReact", category: "Frontend", color: "#000000", bg: "#EEEEEE", ariaLabel: "" };

export const SkillsAdmin: React.FC = () => {
  const { items, loading, saving, error, save } = useAdminResource<SkillData>("skills");
  const [draft, setDraft] = useState<SkillData[]>([]);

  useEffect(() => setDraft(items), [items]);

  const updateItem = (index: number, next: SkillData) => {
    setDraft((prev) => prev.map((item, i) => (i === index ? next : item)));
  };
  const removeItem = (index: number) => setDraft((prev) => prev.filter((_, i) => i !== index));
  const addItem = () => setDraft((prev) => [...prev, { ...EMPTY, id: `skill-${Date.now()}` }]);

  if (loading) return <Container sx={{ py: 4 }}>Carregando...</Container>;

  return (
    <Container sx={{ py: 4, display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h4">Skills</Typography>
      {error && <Typography color="error">{error}</Typography>}

      {draft.map((item, index) => (
        <Paper key={item.id || index} sx={{ p: 3, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
          <TextField label="Nome" value={item.name} onChange={(e) => updateItem(index, { ...item, name: e.target.value })} />
          <TextField
            select
            label="Ícone"
            value={item.iconName}
            onChange={(e) => updateItem(index, { ...item, iconName: e.target.value })}
            sx={{ minWidth: 160 }}
          >
            {Object.keys(skillIconRegistry).map((name) => (
              <MenuItem key={name} value={name}>{name}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Categoria"
            value={item.category}
            onChange={(e) => updateItem(index, { ...item, category: e.target.value as SkillCategory })}
            sx={{ minWidth: 140 }}
          >
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </TextField>
          <TextField label="Cor" value={item.color} onChange={(e) => updateItem(index, { ...item, color: e.target.value })} sx={{ width: 120 }} />
          <TextField label="Fundo" value={item.bg} onChange={(e) => updateItem(index, { ...item, bg: e.target.value })} sx={{ width: 120 }} />
          <TextField label="Aria label" value={item.ariaLabel} onChange={(e) => updateItem(index, { ...item, ariaLabel: e.target.value })} />
          <IconButton onClick={() => removeItem(index)} aria-label="remover">
            <DeleteIcon />
          </IconButton>
        </Paper>
      ))}

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="outlined" onClick={addItem}>Adicionar skill</Button>
        <Button variant="contained" disabled={saving} onClick={() => save(draft)}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </Box>
    </Container>
  );
};
```

- [ ] **Step 5: Criar `ProjectsAdmin.tsx`**

```tsx
// portifolio/src/pages/admin/ProjectsAdmin.tsx
import React, { useEffect, useState } from "react";
import { Box, Container, Typography, Button, TextField, MenuItem, IconButton, Paper, Chip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAdminResource } from "./hooks/useAdminResource";
import { LocalizedTextField } from "./components/LocalizedTextField";
import type { CardType } from "../../Types/cardType";

const TYPES = ["Sites", "Landing Pages", "Aplicativos", "E-Commerce", "Outros"];

const EMPTY: CardType = {
  id: "",
  title: { pt: "", en: "" },
  description: { pt: "", en: "" },
  languages: [],
  type: "Sites",
  status: { pt: "Concluído", en: "Done" },
  date: "",
};

export const ProjectsAdmin: React.FC = () => {
  const { items, loading, saving, error, save } = useAdminResource<CardType>("projects");
  const [draft, setDraft] = useState<CardType[]>([]);

  useEffect(() => setDraft(items), [items]);

  const updateItem = (index: number, next: CardType) => {
    setDraft((prev) => prev.map((item, i) => (i === index ? next : item)));
  };
  const removeItem = (index: number) => setDraft((prev) => prev.filter((_, i) => i !== index));
  const addItem = () => setDraft((prev) => [...prev, { ...EMPTY, id: `proj-${Date.now()}` }]);

  if (loading) return <Container sx={{ py: 4 }}>Carregando...</Container>;

  return (
    <Container sx={{ py: 4, display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h4">Projetos</Typography>
      {error && <Typography color="error">{error}</Typography>}

      {draft.map((item, index) => (
        <Paper key={item.id || index} sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="subtitle1">{item.id || "(novo)"}</Typography>
            <IconButton onClick={() => removeItem(index)} aria-label="remover">
              <DeleteIcon />
            </IconButton>
          </Box>
          <LocalizedTextField label="Título" value={item.title} onChange={(v) => updateItem(index, { ...item, title: v })} />
          <LocalizedTextField label="Descrição" value={item.description} onChange={(v) => updateItem(index, { ...item, description: v })} multiline />
          <TextField
            select
            label="Tipo"
            value={item.type}
            onChange={(e) => updateItem(index, { ...item, type: e.target.value })}
            sx={{ maxWidth: 240 }}
          >
            {TYPES.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </TextField>
          <LocalizedTextField label="Status" value={item.status} onChange={(v) => updateItem(index, { ...item, status: v })} />
          <TextField
            label="Tecnologias (separadas por vírgula)"
            value={item.languages.join(", ")}
            onChange={(e) => updateItem(index, { ...item, languages: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
          />
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {item.languages.map((lang) => (
              <Chip key={lang} label={lang} size="small" />
            ))}
          </Box>
          <TextField label="Data (DD/MM/AAAA)" value={item.date} onChange={(e) => updateItem(index, { ...item, date: e.target.value })} sx={{ maxWidth: 200 }} />
          <TextField label="Link do site" value={item.siteLink ?? ""} onChange={(e) => updateItem(index, { ...item, siteLink: e.target.value })} />
          <TextField label="Link do GitHub" value={item.gitHubLink ?? ""} onChange={(e) => updateItem(index, { ...item, gitHubLink: e.target.value })} />
          <TextField
            label="Caminho da imagem (asset existente)"
            value={item.image ?? ""}
            onChange={(e) => updateItem(index, { ...item, image: e.target.value })}
          />
          <TextField
            label="Caminho do vídeo (asset existente)"
            value={item.video ?? ""}
            onChange={(e) => updateItem(index, { ...item, video: e.target.value })}
          />
        </Paper>
      ))}

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="outlined" onClick={addItem}>Adicionar projeto</Button>
        <Button variant="contained" disabled={saving} onClick={() => save(draft)}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </Box>
    </Container>
  );
};
```

- [ ] **Step 6: Criar `UserAdmin.tsx`**

```tsx
// portifolio/src/pages/admin/UserAdmin.tsx
import React, { useEffect, useState } from "react";
import { Box, Container, Typography, Button, TextField, Input } from "@mui/material";
import { fetchUser, saveUser, uploadResume, AdminApiError } from "../../api/adminApi";
import { LocalizedTextField } from "./components/LocalizedTextField";
import type { User } from "../../Types/userType";
import type { LocalizedText } from "../../Types/LocalizedText";

type EditableUser = Omit<User, "img" | "curriculo">;

const EMPTY: EditableUser = {
  name: "",
  desc: { pt: "", en: "" },
  emailName: "",
  linkedinName: "",
  githubName: "",
  links: {},
  telefone: "",
  caracteristicas: [],
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const UserAdmin: React.FC = () => {
  const [user, setUser] = useState<EditableUser>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeStatus, setResumeStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchUser<EditableUser>()
      .then((data) => data && setUser(data))
      .catch((err) => setError(err instanceof AdminApiError ? err.message : "Erro ao carregar"))
      .finally(() => setLoading(false));
  }, []);

  const updateCaracteristica = (index: number, next: LocalizedText) => {
    setUser((prev) => ({
      ...prev,
      caracteristicas: prev.caracteristicas.map((c, i) => (i === index ? next : c)),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveUser(user);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeStatus("Enviando...");
    try {
      const base64 = await fileToBase64(file);
      await uploadResume(base64);
      setResumeStatus("Currículo atualizado.");
    } catch (err) {
      setResumeStatus(err instanceof AdminApiError ? err.message : "Erro ao enviar currículo");
    }
  };

  if (loading) return <Container sx={{ py: 4 }}>Carregando...</Container>;

  return (
    <Container sx={{ py: 4, display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h4">Dados pessoais</Typography>
      {error && <Typography color="error">{error}</Typography>}

      <TextField label="Nome" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
      <LocalizedTextField label="Descrição" value={user.desc} onChange={(v) => setUser({ ...user, desc: v })} multiline />
      <TextField label="Email" value={user.emailName} onChange={(e) => setUser({ ...user, emailName: e.target.value })} />
      <TextField label="Telefone" value={user.telefone} onChange={(e) => setUser({ ...user, telefone: e.target.value })} />
      <TextField label="LinkedIn (usuário)" value={user.linkedinName} onChange={(e) => setUser({ ...user, linkedinName: e.target.value })} />
      <TextField label="GitHub (usuário)" value={user.githubName} onChange={(e) => setUser({ ...user, githubName: e.target.value })} />

      <Typography variant="h6">Características (palavras animadas do Hero)</Typography>
      {user.caracteristicas.map((c, i) => (
        <LocalizedTextField key={i} label={`Característica ${i + 1}`} value={c} onChange={(v) => updateCaracteristica(i, v)} />
      ))}

      <Typography variant="h6">Currículo</Typography>
      <Input type="file" inputProps={{ accept: "application/pdf" }} onChange={handleResumeUpload} />
      {resumeStatus && <Typography variant="body2">{resumeStatus}</Typography>}

      <Box>
        <Button variant="contained" disabled={saving} onClick={handleSave}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </Box>
    </Container>
  );
};
```

- [ ] **Step 7: Registrar as 5 rotas em `App.tsx`**

Adicionar os imports:

```tsx
import { ExperiencesAdmin } from "./pages/admin/ExperiencesAdmin";
import { ProjectsAdmin } from "./pages/admin/ProjectsAdmin";
import { SkillsAdmin } from "./pages/admin/SkillsAdmin";
import { ServicesAdmin } from "./pages/admin/ServicesAdmin";
import { UserAdmin } from "./pages/admin/UserAdmin";
```

Adicionar dentro de `<Routes>`, após a rota `/admin`:

```tsx
            <Route path="/admin/experiences" element={<AdminRoute><ExperiencesAdmin /></AdminRoute>} />
            <Route path="/admin/projects" element={<AdminRoute><ProjectsAdmin /></AdminRoute>} />
            <Route path="/admin/skills" element={<AdminRoute><SkillsAdmin /></AdminRoute>} />
            <Route path="/admin/services" element={<AdminRoute><ServicesAdmin /></AdminRoute>} />
            <Route path="/admin/user" element={<AdminRoute><UserAdmin /></AdminRoute>} />
```

- [ ] **Step 8: Rodar o typecheck e o build**

```bash
cd portifolio && npx tsc -b --noEmit && npm run build
```

Expected: sem erros.

- [ ] **Step 9: Commit**

```bash
git add portifolio/src/pages/admin portifolio/src/App.tsx
git commit -m "feat: add CRUD screens for experiences, projects, skills, services and user"
```

---

### Task 14: Configurar variáveis de ambiente e validar ponta a ponta

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Documentar as novas variáveis em `.env.example`**

Adicionar ao final de `/Users/guilhermevieira/Documents/Programacao/Portifolio_Lab/.env.example`:

```
# Admin (/admin) — GitHub Contents API + sessão
ADMIN_PASSWORD=
ADMIN_JWT_SECRET=
GITHUB_TOKEN=
GITHUB_OWNER=GuilhermeVieira05
GITHUB_REPO=Portifolio_Lab
GITHUB_BRANCH=main
```

- [ ] **Step 2: Gerar um `GITHUB_TOKEN` (ação manual do usuário, fora do escopo de código)**

Este passo não é executado pelo agente: o usuário deve criar um Personal Access Token (fine-grained, escopo somente neste repositório, permissão "Contents: Read and write") em https://github.com/settings/tokens e configurar as 6 variáveis do Step 1 nas Environment Variables do projeto na Vercel (Production e Preview).

- [ ] **Step 3: Rodar a suíte de testes completa**

```bash
cd portifolio && npm run test
```

Expected: todos os testes das Tasks 1, 2, 3, 4, 5 e 9 passam (32 testes no total).

- [ ] **Step 4: Rodar o typecheck e o build completos**

```bash
cd portifolio && npx tsc -b --noEmit && npm run build
```

Expected: sem erros.

- [ ] **Step 5: Deploy em preview e teste manual ponta a ponta**

Após o push do branch (fora deste plano — depende do fluxo de deploy do usuário), com as env vars configuradas na Vercel:
1. Acessar `/admin/login` no preview, entrar com a senha correta.
2. Editar uma experiência de teste, salvar, confirmar que um commit aparece no GitHub (`git log` no repo) e que `/` reflete a mudança após o redeploy.
3. Tentar acessar `/admin` sem estar logado (aba anônima) — confirmar redirecionamento para `/admin/login`.
4. Tentar 6 logins com senha errada seguidos — confirmar bloqueio (HTTP 429) na 6ª tentativa.
5. Fazer upload de um PDF de teste como currículo — confirmar que o link de download em `/` aponta para o novo arquivo após o redeploy.

- [ ] **Step 6: Commit**

```bash
git add .env.example
git commit -m "docs: document admin environment variables"
```

---

## Critério de pronto (spec completa)

- Login com a senha correta concede acesso; senha errada nega; 5 tentativas incorretas em 15 minutos bloqueiam a 6ª.
- Criar/editar/excluir um item em cada uma das 5 categorias resulta em um commit no GitHub e a mudança aparece no site após o redeploy automático da Vercel.
- Upload de um novo currículo substitui o PDF servido pelo site.
- O site público continua funcionando exatamente como antes — mesma navegação, sem chamadas de API novas para visitantes comuns, lendo os JSONs em build-time.
- Trocar entre pt/en no site público mostra corretamente os textos bilíngues vindos dos novos JSONs.
- Todas as camadas de lógica pura (`GitHubContentClient`, `JsonResourceRepository`, `AdminAuth`, `LoginRateLimiter`, validadores, `requireAdminSession`) têm testes unitários passando, isolados de rede e do Vercel runtime.
