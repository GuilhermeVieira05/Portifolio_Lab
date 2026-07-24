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

export async function uploadProjectMedia(
  fileBase64: string,
  filename: string,
  kind: "image" | "video"
): Promise<{ url: string }> {
  const response = await fetch("/api/admin/upload-project-media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ fileBase64, filename, kind }),
  });
  return parseJsonOrThrow(response);
}
