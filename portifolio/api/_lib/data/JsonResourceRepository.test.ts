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
