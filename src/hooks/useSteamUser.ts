import { useEffect, useState } from "react";
import { apiService } from "~/services/api";
import type { SteamUser } from "~/types/steam";

interface SteamUserResponse {
  success: boolean;
  isLoggedIn: boolean;
  user?: SteamUser;
  error?: string;
}

export function useSteamUser() {
  const [user, setUser] = useState<SteamUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Use ApiService with caching options
        // Cache for 5 minutes with user-specific tag
        const data = await apiService.get<SteamUserResponse>("/auth/steam/user", {
          revalidate: 300,
          tags: ["steam-user"]
        });

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch user data");
        }

        if (!data.isLoggedIn) {
          setUser(null);
          return;
        }

        if (!data.user) {
          throw new Error("User data missing from response");
        }

        setUser(data.user);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch user";
        setError(errorMessage);
        console.error("Failed to fetch Steam user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Function to manually refresh user data if needed
  const refreshUser = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Force fresh data fetch by setting revalidate to false
      const data = await apiService.get<SteamUserResponse>("/auth/steam/user", {
        revalidate: false
      });

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch user data");
      }

      if (!data.isLoggedIn) {
        setUser(null);
        return;
      }

      if (!data.user) {
        throw new Error("User data missing from response");
      }

      setUser(data.user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch user";
      setError(errorMessage);
      console.error("Failed to refresh Steam user:", err);
    } finally {
      setLoading(false);
    }
  };

  return { 
    user, 
    loading, 
    error,
    refreshUser // Expose refresh function for manual revalidation
  };
}
