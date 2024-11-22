"use client";

import { Suspense, useEffect, useState } from "react";

import Link from "next/link";

import { AuthProtection } from "~/components/AuthProtection";
import { FriendCard, FriendCardSkeleton } from "~/components/FriendCard";
import { ScreenshotGrid } from "~/components/ScreenshotGrid";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { Container } from "~/components/ui/Container";
// import { Progress } from "~/components/ui/Progress";
import { Spinner } from "~/components/ui/Spinner";
import { Text } from "~/components/ui/Text";

import type { SteamFriend, SteamScreenshot, SteamUser } from "~/types/steam";

const ITEMS_PER_PAGE = 12;

function LoadingState() {
  return (
    <Container>
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    </Container>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <Card className="p-6 text-center">
      <Text className="text-red-600 mb-4">{error}</Text>
      <Button onClick={onRetry}>Try Again</Button>
    </Card>
  );
}

function DashboardContent() {
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<SteamUser | null>(null);
  const [screenshots, setScreenshots] = useState<SteamScreenshot[]>([]);
  const [friends, setFriends] = useState<SteamFriend[]>([]);
  const [isLoadingScreenshots, setIsLoadingScreenshots] = useState(false);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [activeTab, setActiveTab] = useState<"screenshots" | "friends">("screenshots");
  const [screenshotsPage, setScreenshotsPage] = useState(1);
  const [friendsPage, setFriendsPage] = useState(1);
  const [totalScreenshots, setTotalScreenshots] = useState(0);
  const [totalFriends, setTotalFriends] = useState(0);
  const [totalScreenshotPages, setTotalScreenshotPages] = useState(1);
  const [totalFriendPages, setTotalFriendPages] = useState(1);
  const [loadingProgress, setLoadingProgress] = useState<
    { loaded: number; total: number } | undefined
  >(undefined);

  const loadScreenshots = async (steamId: string, page: number = 1) => {
    setIsLoadingScreenshots(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/steam/screenshots?steamid=${steamId}&page=${page}&limit=${ITEMS_PER_PAGE}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch screenshots: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to load screenshots");
      }

      setScreenshots(data.screenshots || []);
      setTotalScreenshots(data.total_count);
      setTotalScreenshotPages(data.total_pages || 1);
      setLoadingProgress(undefined);
    } catch (error) {
      console.error("Screenshot error:", error);
      setError(`Failed to load screenshots: ${(error as Error).message}`);
    } finally {
      setIsLoadingScreenshots(false);
    }
  };

  const loadFriends = async (steamId: string, page: number = 1, countOnly: boolean = false) => {
    if (!countOnly) setIsLoadingFriends(true);
    try {
      const response = await fetch(
        `/api/steam/friends?steamid=${steamId}&page=${page}&limit=${ITEMS_PER_PAGE}${countOnly ? "&count_only=true" : ""}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch friends: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to load friends");
      }

      setTotalFriends(data.total_count);
      setTotalFriendPages(data.total_pages || 1);

      if (!countOnly) {
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error("Friends error:", error);
      if (!countOnly) {
        setError(`Failed to load friends: ${(error as Error).message}`);
      }
    } finally {
      if (!countOnly) setIsLoadingFriends(false);
    }
  };

  const handleScreenshotsPageChange = (page: number) => {
    if (user) {
      setScreenshotsPage(page);
      loadScreenshots(user.steamid, page);
    }
  };

  const handleFriendsPageChange = (page: number) => {
    if (user) {
      setFriendsPage(page);
      loadFriends(user.steamid, page);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await fetch("/api/auth/steam/user");
        const data = await response.json();
        setUser(data.user);

        // Load initial data
        await Promise.all([
          loadScreenshots(data.user.steamid),
          loadFriends(data.user.steamid, 1, true), // Load only friend count initially
        ]);
      } catch (error) {
        console.error("Data loading error:", error);
        setError(`Failed to load data: ${(error as Error).message}`);
      }
    };

    loadInitialData();
  }, []);

  // Load friends data when switching to friends tab
  useEffect(() => {
    if (user && activeTab === "friends" && friends.length === 0) {
      loadFriends(user.steamid);
    }
  }, [user, activeTab, friends.length]);

  // Set up periodic refresh of friends data when friends tab is active
  useEffect(() => {
    if (!user || activeTab !== "friends") return;

    const refreshFriends = () => {
      loadFriends(user.steamid, friendsPage);
    };

    // Refresh friends data every 30 seconds
    const interval = setInterval(refreshFriends, 30000);

    return () => clearInterval(interval);
  }, [user, friendsPage, activeTab]);

  const handleRetry = async () => {
    if (user) {
      setError(null);
      if (activeTab === "screenshots") {
        await loadScreenshots(user.steamid, screenshotsPage);
      } else {
        await loadFriends(user.steamid, friendsPage);
      }
    }
  };

  return (
    <Container>
      <div className="py-8">
        <div className="flex items-center justify-between mb-8">
          <Text variant="h1">Steam Dashboard</Text>
          {user && (
            <div className="flex items-center space-x-4">
              <img
                src={user.avatarmedium}
                alt={user.personaname}
                className="w-10 h-10 rounded-full"
              />
              <div className="text-right">
                <Text>{user.personaname}</Text>
                <Link
                  href="/steam"
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  View Profile
                </Link>
              </div>
            </div>
          )}
        </div>

        {error ? (
          <ErrorState error={error} onRetry={handleRetry} />
        ) : (
          <>
            <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab("screenshots")}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "screenshots"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                My Screenshots
              </button>
              <button
                onClick={() => setActiveTab("friends")}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "friends"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Friends ({totalFriends})
              </button>
            </div>

            <Suspense fallback={<LoadingState />}>
              {activeTab === "screenshots" ? (
                <ScreenshotGrid
                  screenshots={screenshots}
                  isLoading={isLoadingScreenshots}
                  _totalCount={totalScreenshots}
                  currentPage={screenshotsPage}
                  totalPages={totalScreenshotPages}
                  onPageChange={handleScreenshotsPageChange}
                  loadingProgress={loadingProgress}
                />
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoadingFriends && friends.length === 0 ? (
                      [...Array(6)].map((_, i) => <FriendCardSkeleton key={i} />)
                    ) : friends.length === 0 ? (
                      <Card className="p-6 text-center col-span-full">
                        <Text className="mb-4">No friends found</Text>
                        <Text className="text-sm text-gray-600 dark:text-gray-400">
                          Your friends list might be private or you haven't added any friends yet.
                        </Text>
                      </Card>
                    ) : (
                      friends.map((friend) => <FriendCard key={friend.steamid} friend={friend} />)
                    )}
                  </div>

                  {totalFriendPages > 1 && (
                    <div className="flex justify-center space-x-2">
                      {[...Array(totalFriendPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => handleFriendsPageChange(i + 1)}
                          className={`px-3 py-2 rounded-md text-sm font-medium ${
                            friendsPage === i + 1
                              ? "bg-blue-600 text-white"
                              : "hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                          disabled={isLoadingFriends}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Suspense>
          </>
        )}
      </div>
    </Container>
  );
}

export default function DashboardPage() {
  return (
    <AuthProtection>
      <DashboardContent />
    </AuthProtection>
  );
}
