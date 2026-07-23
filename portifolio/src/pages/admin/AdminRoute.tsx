import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { fetchUser } from "../../api/adminApi";

type Props = { children: React.ReactNode };

export const AdminRoute: React.FC<Props> = ({ children }) => {
  const [status, setStatus] = useState<"checking" | "authenticated" | "unauthenticated">("checking");

  useEffect(() => {
    fetchUser()
      .then(() => setStatus("authenticated"))
      .catch(() => setStatus("unauthenticated"));
  }, []);

  if (status === "checking") return null;
  if (status === "unauthenticated") return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};
