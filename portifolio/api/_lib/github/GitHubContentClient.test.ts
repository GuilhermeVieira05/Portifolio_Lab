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
