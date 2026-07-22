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
