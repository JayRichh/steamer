import { NextRequest, NextResponse } from "next/server";

import { validateSteamSession } from "~/utils/steam";
import { config, getSteamApiUrl } from "~/config/env";
import type { SteamGame } from "~/types/steam";

interface EnrichedGame extends SteamGame {
  news?: any[];
  achievements?: any[];
}

async function getGameNews(appId: number): Promise<any[]> {
  try {
    const response = await fetch(
      getSteamApiUrl("gameNews", {
        appid: appId.toString(),
        count: "5",
        maxlength: "300",
      })
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.appnews?.newsitems || [];
  } catch (error) {
    console.error(`Error fetching news for game ${appId}:`, error);
    return [];
  }
}

async function getGameAchievements(steamId: string, appId: number): Promise<any[]> {
  try {
    const response = await fetch(
      getSteamApiUrl("achievements", {
        appid: appId.toString(),
        steamid: steamId,
      })
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.playerstats?.achievements || [];
  } catch (error) {
    console.error(`Error fetching achievements for game ${appId}:`, error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const sessionCookie = request.cookies.get("steam_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = JSON.parse(sessionCookie.value);
    if (!validateSteamSession(userData)) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Get steamid from query params or session
    const searchParams = request.nextUrl.searchParams;
    const steamId = searchParams.get("steamid") || userData.steamid;
    const includeDetails = searchParams.get("details") === "true";

    if (!steamId) {
      return NextResponse.json({ error: "Steam ID required" }, { status: 400 });
    }

    // Fetch owned games
    const gamesResponse = await fetch(
      getSteamApiUrl("ownedGames", {
        steamid: steamId,
        include_appinfo: "1",
        include_played_free_games: "1",
      }),
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );

    if (!gamesResponse.ok) {
      throw new Error("Failed to fetch games list");
    }

    const gamesData = await gamesResponse.json();
    let games: SteamGame[] = gamesData.response?.games || [];

    // Sort games by playtime
    games.sort((a, b) => (b.playtime_2weeks || 0) - (a.playtime_2weeks || 0));

    // If details requested, fetch additional info for recently played games
    if (includeDetails) {
      const recentGames = games
        .filter((game) => game.playtime_2weeks && game.playtime_2weeks > 0)
        .slice(0, 5);

      // Fetch additional details in parallel
      const enrichedGames = await Promise.all(
        recentGames.map(async (game) => {
          const [news, achievements] = await Promise.all([
            getGameNews(game.appid),
            getGameAchievements(steamId, game.appid),
          ]);

          return {
            ...game,
            news,
            achievements,
          } as EnrichedGame;
        })
      );

      // Replace the original games with enriched ones
      games = games.map((game) => {
        const enriched = enrichedGames.find((g) => g.appid === game.appid);
        return enriched || game;
      });
    }

    if (config.isDev) {
      console.log(`Fetched ${games.length} games for user ${steamId}`);
      if (includeDetails) {
        console.log("Including additional details for recent games");
      }
    }

    return NextResponse.json({
      success: true,
      games,
      total_count: games.length,
    });
  } catch (error) {
    console.error("Games API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch games",
        details: config.isDev ? (error as Error).message : undefined,
        games: [],
        total_count: 0,
      },
      { status: 500 }
    );
  }
}
