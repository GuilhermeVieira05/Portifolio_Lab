import { useCallback, useState } from "react";

/** Shows a transient "saved" confirmation after a successful save() call. */
export function useSaveFeedback() {
  const [justSaved, setJustSaved] = useState(false);

  const notifySaved = useCallback(() => {
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  }, []);

  return { justSaved, notifySaved };
}
