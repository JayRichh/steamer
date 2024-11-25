"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select } from "./ui/Select";
import { Text } from "./ui/Text";
import { Spinner } from "./ui/Spinner";
import type { SteamGame } from "~/types/steam";

interface CategoryFilterProps {
  type: "games";
  steamId: string;
  showSearch?: boolean;
  showSort?: boolean;
  className?: string;
}

export function CategoryFilter({
  type,
  steamId,
  showSearch = true,
  showSort = true,
  className,
}: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [games, setGames] = useState<SteamGame[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGames = useCallback(async () => {
    try {
      const response = await fetch(`/api/steam/games?steamid=${steamId}&inventory_only=true`);
      if (!response.ok) throw new Error("Failed to fetch games");
      const data = await response.json();
      setGames(data.games || []);
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setLoading(false);
    }
  }, [steamId]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const handleGameChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("appid", value);
    } else {
      params.delete("appid");
    }
    // Reset to page 1 when changing games
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const currentGame = searchParams.get("appid") || "";

  if (loading) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2">
          <Spinner size="sm" />
          <Text color="secondary">Loading games...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <Select
            label="Filter by Game"
            value={currentGame}
            onChange={handleGameChange}
            options={[
              { value: "", label: "All Games" },
              ...games
                .sort((a, b) => {
                  // Always put Steam Community first
                  if (a.appid === 753) return -1;
                  if (b.appid === 753) return 1;
                  // Then sort by playtime
                  return (b.playtime_2weeks || 0) - (a.playtime_2weeks || 0);
                })
                .map(game => ({
                  value: game.appid.toString(),
                  label: game.name,
                })),
            ]}
          />
          <Text variant="body-sm" color="secondary" className="mt-1">
            {games.length > 0
              ? `${games.length} games available`
              : "No games found"}
          </Text>
        </div>
      </div>
    </div>
  );
}
