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
