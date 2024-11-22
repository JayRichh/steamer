"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { AuthProtection } from "~/components/AuthProtection";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { Container } from "~/components/ui/Container";
// import { Spinner } from "~/components/ui/Spinner";
import { Text } from "~/components/ui/Text";

import type { SteamGame, SteamPersonaState, SteamUser } from "~/types/steam";
import { STEAM_PERSONA_STATES, getPersonaStateColor, getPersonaStateText } from "~/types/steam";

function ProfileContent() {
  const [_error, setError] = useState<string | null>(null);
  const [steamUser, setSteamUser] = useState<SteamUser | null>(null);
  const [recentGames, setRecentGames] = useState<SteamGame[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(false);

  const loadRecentGames = async (steamId: string) => {
    setIsLoadingGames(true);
    try {
      const response = await fetch(`/api/steam/games?steamid=${steamId}&details=true`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to load games");
      }

      const games = data.games || [];
      const recent = games
        .filter((game: SteamGame) => game.playtime_2weeks && game.playtime_2weeks > 0)
        .sort((a: SteamGame, b: SteamGame) => (b.playtime_2weeks || 0) - (a.playtime_2weeks || 0))
        .slice(0, 5);

      setRecentGames(recent);
    } catch (error) {
      console.error("Games error:", error);
    } finally {
      setIsLoadingGames(false);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch("/api/auth/steam/user");
        const data = await response.json();
        setSteamUser(data.user);
        await loadRecentGames(data.user.steamid);
      } catch (error) {
        setError("Failed to load profile");
        console.error("Profile error:", error);
      }
    };

    loadProfile();
  }, []);

  if (!steamUser) {
    return null;
  }

  const personaState = (steamUser.personastate ??
    STEAM_PERSONA_STATES.OFFLINE) as SteamPersonaState;
  const stateText = getPersonaStateText(personaState);
  const stateColor = getPersonaStateColor(personaState);

  return (
    <Container>
      <div className="py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="flex items-start space-x-6">
              <img
                src={steamUser.avatarfull}
                alt={steamUser.personaname}
                className="w-32 h-32 rounded-lg"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="h1" className="mb-2">
                      {steamUser.personaname}
                    </Text>
                    <Text className={`${stateColor} font-medium`}>
                      {stateText}
                      {steamUser.gameextrainfo && (
                        <span className="ml-2">- Playing {steamUser.gameextrainfo}</span>
                      )}
                    </Text>
                  </div>
                  <Link href="/dashboard">
                    <Button>View Dashboard</Button>
                  </Link>
                </div>
                <div className="mt-4 space-y-2">
                  <Text className="text-gray-600 dark:text-gray-300">
                    Steam ID: {steamUser.steamid}
                  </Text>
                  {steamUser.timecreated && (
                    <Text className="text-gray-600 dark:text-gray-300">
                      Member since: {new Date(steamUser.timecreated * 1000).toLocaleDateString()}
                    </Text>
                  )}
                  <div className="flex space-x-4">
                    <a
                      href={steamUser.profileurl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      Steam Community Profile
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Text variant="h3" className="mb-4">
                Recent Activity
              </Text>
              {isLoadingGames ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="p-4">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : recentGames.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentGames.map((game) => (
                    <Card key={game.appid} className="p-4">
                      <Text className="font-medium mb-2">{game.name}</Text>
                      <Text className="text-sm text-gray-600 dark:text-gray-400">
                        Played for {Math.round(((game.playtime_2weeks || 0) / 60) * 10) / 10} hours{" "}
                        in the last 2 weeks
                      </Text>
                    </Card>
                  ))}
                </div>
              ) : (
                <Text className="text-gray-600 dark:text-gray-400">No recent game activity</Text>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Container>
  );
}

export default function SteamProfilePage() {
  return (
    <AuthProtection>
      <ProfileContent />
    </AuthProtection>
  );
}
