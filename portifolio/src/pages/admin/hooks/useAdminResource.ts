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
