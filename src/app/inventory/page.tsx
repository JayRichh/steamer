import { Suspense } from "react";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import { validateSteamSession } from "~/utils/steam";
import { getFullPageUrl } from "~/config/env";
import { AuthProtection } from "~/components/AuthProtection";
import { CategoryFilter } from "~/components/CategoryFilter";
import { Container } from "~/components/ui/Container";
import { Card } from "~/components/ui/Card";
import { Spinner } from "~/components/ui/Spinner";
import { Text } from "~/components/ui/Text";
import InventoryGrid from "./InventoryGrid";

export const metadata: Metadata = {
  title: "Steam Inventory | SteamShare",
  description: "View and manage your Steam inventory items",
  openGraph: {
    title: "Steam Inventory | SteamShare",
    description: "View and manage your Steam inventory items",
    url: getFullPageUrl("/inventory"),
  },
};

export const dynamic = "force-dynamic";

async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("steam_session");
  if (!sessionCookie?.value) return null;

  try {
    const userData = JSON.parse(sessionCookie.value);
    if (!validateSteamSession(userData)) return null;
    return userData;
  } catch {
    return null;
  }
}

function InventoryContent({ user }: { user: any }) {
  const searchParams = new URLSearchParams(window?.location?.search);
  const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1;
  const appId = searchParams.get("appid") || undefined;

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

export default async function InventoryPage() {
  const user = await getSessionUser();
  if (!user) redirect("/");

  return (
    <AuthProtection>
      <InventoryContent user={user} />
    </AuthProtection>
  );
}
