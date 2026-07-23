import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { fetchUser } from "../../api/adminApi";

type Props = { children: React.ReactNode };

export const AdminRoute: React.FC<Props> = ({ children }) => {
  const [status, setStatus] = useState<"checking" | "authenticated" | "unauthenticated">("checking");

  useEffect(() => {
    // Reuses GET /api/admin/data/user as an authenticated ping — this route
    // resolves 200 { user: null } when user.json is legitimately empty and
    // only rejects (401) when the session cookie is missing/invalid, so a
    // resolve always means "authenticated" regardless of the payload.
    fetchUser()
      .then(() => setStatus("authenticated"))
      .catch(() => setStatus("unauthenticated"));
  }, []);

  if (status === "checking") return null;
  if (status === "unauthenticated") return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};
