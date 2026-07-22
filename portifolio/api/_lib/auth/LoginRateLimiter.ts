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
