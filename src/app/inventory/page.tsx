"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthProtection } from "~/components/AuthProtection";
import { CategoryFilter } from "~/components/CategoryFilter";
import { Container } from "~/components/ui/Container";
import { Card } from "~/components/ui/Card";
import { Spinner } from "~/components/ui/Spinner";
import { Text } from "~/components/ui/Text";
import { Button } from "~/components/ui/Button";
import InventoryGrid from "./InventoryGrid";
import type { SteamUser } from "~/types/steam";

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

function InventoryContent() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<SteamUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch("/api/auth/steam/user");
        if (!response.ok) {
          if (response.status === 401) {
            router.push("/");
            return;
          }
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || "Failed to load user data");
        }
        setUser(data.user);
      } catch (error) {
        console.error("User data error:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const searchParams = new URLSearchParams(window?.location?.search);
  const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1;
  const appId = searchParams.get("appid") || undefined;

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => window.location.reload()} />;
  }

  if (!user) {
    return null;
  }

  return (
    <Container>
      <div className="py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Text variant="h1">Inventory</Text>
            <Text color="secondary" className="mt-1">
              Browse and manage your Steam inventory items
            </Text>
          </div>
          
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
        </div>

        <Card className="p-6">
          <Suspense
            fallback={
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            }
          >
            <CategoryFilter
              type="games"
              steamId={user.steamid}
              showSearch={false}
              showSort={false}
              className="mb-6"
            />

            <InventoryGrid
              steamId={user.steamid}
              page={page}
              appId={appId}
            />
          </Suspense>
        </Card>
      </div>
    </Container>
  );
}

export default function InventoryPage() {
  return (
    <AuthProtection>
      <InventoryContent />
    </AuthProtection>
  );
}
