import { useState } from "react";

import Link from "next/link";

import { ScreenshotGrid } from "~/components/ScreenshotGrid";
import { Badge } from "~/components/ui/Badge";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { Modal } from "~/components/ui/Modal";
import { Text } from "~/components/ui/Text";

import type { SteamFriend, SteamPersonaState, SteamScreenshot } from "~/types/steam";
import { STEAM_PERSONA_STATES, getPersonaStateColor, getPersonaStateText } from "~/types/steam";

interface FriendCardProps {
  friend: SteamFriend;
}

export function FriendCard({ friend }: FriendCardProps) {
  const [showScreenshots, setShowScreenshots] = useState(false);
  const [screenshots, setScreenshots] = useState<SteamScreenshot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const personaState = (friend.personastate ?? STEAM_PERSONA_STATES.OFFLINE) as SteamPersonaState;
  const stateText = getPersonaStateText(personaState);
  const stateColor = getPersonaStateColor(personaState);

  const loadScreenshots = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/steam/screenshots?steamid=${friend.steamid}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load screenshots");
      }

      setScreenshots(data.screenshots || []);
      setShowScreenshots(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load screenshots");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
        <div className="p-3">
          <div className="flex items-start space-x-3">
            {/* Avatar and Status */}
            <div className="relative flex-shrink-0">
              <img
                src={friend.avatarmedium || friend.avatar}
                alt={friend.personaname}
                className="w-12 h-12 rounded-lg"
              />
              <div
                className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${stateColor.replace("text-", "bg-")} border-2 border-white dark:border-gray-800 shadow-sm`}
                title={stateText}
              />
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <Text className="font-medium truncate">{friend.personaname}</Text>
              </div>

              {/* Game Status */}
              {friend.gameextrainfo ? (
                <div className="mt-0.5 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5" />
                  <Text className="text-sm text-green-600 dark:text-green-400 font-medium truncate">
                    {friend.gameextrainfo}
                  </Text>
                </div>
              ) : (
                <Text className="text-xs text-gray-500 mt-0.5">
                  Last online: {new Date(friend.friend_since * 1000).toLocaleDateString()}
                </Text>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-2 mt-2">
                <Button
                  onClick={loadScreenshots}
                  variant="secondary"
                  size="sm"
                  disabled={isLoading}
                  className="text-xs px-2 py-1 h-7"
                >
                  {isLoading ? "Loading..." : "Screenshots"}
                </Button>
                <a
                  href={friend.profileurl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-2 py-1 h-7 inline-flex items-center bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition-colors duration-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400"
                >
                  Profile
                </a>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {showScreenshots && (
        <Modal isOpen={true} onClose={() => setShowScreenshots(false)} className="max-w-7xl">
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <Text variant="h2">{friend.personaname}'s Screenshots</Text>
              <Button onClick={() => setShowScreenshots(false)} variant="secondary">
                Close
              </Button>
            </div>

            {error ? (
              <Card className="p-6 text-center">
                <Text className="text-red-600 mb-4">{error}</Text>
                <Button onClick={loadScreenshots}>Try Again</Button>
              </Card>
            ) : (
              <ScreenshotGrid screenshots={screenshots} isLoading={isLoading} />
            )}
          </div>
        </Modal>
      )}
    </>
  );
}

export function FriendCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="p-3">
        <div className="flex items-start space-x-3">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2 w-2/3" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2 mb-2" />
            <div className="flex space-x-2">
              <div className="h-7 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
