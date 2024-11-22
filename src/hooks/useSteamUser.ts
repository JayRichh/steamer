import { useEffect, useState } from "react";

import type { SteamUser } from "~/types/steam";

export function useSteamUser() {
  const [user, setUser] = useState<SteamUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/steam/user");
        const data = await response.json();

        if (!data.isLoggedIn) {
          setUser(null);
          return;
        }

        setUser(data.user);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch user");
        console.error("Failed to fetch Steam user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
}
