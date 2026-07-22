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

  it("writeFile with encoding: 'base64' sends content unchanged, preserving binary bytes", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ commit: { sha: "newsha" } }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    // Bytes spanning the full 0-255 range, including many >= 0x80 where a
    // utf-8 re-encode of a latin1-decoded string would corrupt data.
    const originalBytes = Buffer.from([0, 1, 2, 127, 128, 129, 200, 255, 254, 10, 13, 65, 66, 67]);
    const fileBase64 = originalBytes.toString("base64");

    const client = new GitHubContentClient(config);
    await client.writeFile({
      path: "portifolio/src/assets/curriculo.pdf",
      content: fileBase64,
      message: "chore: update resume via admin",
      encoding: "base64",
    });

    const [, options] = fetchMock.mock.calls[0];
    const body = JSON.parse((options as RequestInit).body as string);
    // The base64 string sent to GitHub must be byte-for-byte identical to
    // what was passed in — no re-encoding through an intermediate string.
    expect(body.content).toBe(fileBase64);
    expect(Buffer.from(body.content, "base64").equals(originalBytes)).toBe(true);
  });

  it("writeFile without encoding still utf-8-encodes content (default/back-compat)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ commit: { sha: "newsha" } }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const client = new GitHubContentClient(config);
    await client.writeFile({
      path: "portifolio/src/data/json/user.json",
      content: '{"name":"Guilherme"}',
      message: "chore: update user data via admin",
    });

    const [, options] = fetchMock.mock.calls[0];
    const body = JSON.parse((options as RequestInit).body as string);
    expect(Buffer.from(body.content, "base64").toString("utf-8")).toBe('{"name":"Guilherme"}');
  });
});
