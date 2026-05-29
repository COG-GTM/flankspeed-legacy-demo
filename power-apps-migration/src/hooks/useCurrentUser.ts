/**
 * React hook for accessing the current authenticated user.
 *
 * Migrated from: CurrentUserService injected into controllers via DI
 * Power Apps equivalent: User() function in Power Fx
 */
import { useState, useEffect } from "react";
import { User } from "../models";
import { getCurrentUser } from "../services/AuthService";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, error };
}
