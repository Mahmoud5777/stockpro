"use client";

import { useEffect } from "react";
import { useAuthStore } from "./AuthContext";

export function useAuth() {
  const { token, user, setAuth, logout, loadUser } = useAuthStore();
  useEffect(() => {
    if (token && !user) {
      loadUser();
    }
  }, [token, user, loadUser]);
  return { token, user, setAuth, logout };
}
