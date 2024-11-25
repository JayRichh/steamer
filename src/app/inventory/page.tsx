import { Suspense } from "react";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { validateSteamSession } from "~/utils/steam";
import { getFullPageUrl } from "~/config/env";
import { CategoryFilter } from "~/components/CategoryFilter";
import { PageContainer } from "~/components/PageContainer";
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

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const user = await getSessionUser();
  if (!user) redirect("/");

  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const appId = searchParams.appid;

  return (
    <PageContainer>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Text variant="h1">Inventory</Text>
          <Text color="secondary">
            Browse and manage your Steam inventory items
          </Text>
        </div>

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
      </div>
    </PageContainer>
  );
}
