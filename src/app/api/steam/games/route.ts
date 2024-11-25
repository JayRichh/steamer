import { NextRequest, NextResponse } from "next/server";

import { validateSteamSession } from "~/utils/steam";
import { config, getSteamApiUrl } from "~/config/env";
import type { SteamGame } from "~/types/steam";

interface EnrichedGame extends SteamGame {
  news?: any[];
  achievements?: any[];
}

// Special handling for known games
const KNOWN_GAMES = {
  // CS2/CSGO
  730: {
    name: "Counter-Strike 2",
    hasInventory: true,
    contextId: "2",
  },
  // Dota 2
  570: {
    name: "Dota 2",
    hasInventory: true,
    contextId: "2",
  },
  // Team Fortress 2
  440: {
    name: "Team Fortress 2",
    hasInventory: true,
    contextId: "2",
  },
};

async function getGameNews(appId: number): Promise<any[]> {
  try {
    const response = await fetch(
      getSteamApiUrl("gameNews", {
        appid: appId.toString(),
        count: "5",
        maxlength: "300",
      }),
      {
        next: { 
          revalidate: 3600, // Cache news for 1 hour
          tags: [`game-${appId}-news`]
        }
      }
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
      }),
      {
        next: { 
          revalidate: 1800, // Cache achievements for 30 minutes
          tags: [`game-${appId}-achievements`, `user-${steamId}-achievements`]
        }
      }
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
    const inventoryOnly = searchParams.get("inventory_only") === "true";

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
      { 
        next: { 
          revalidate: 300, // Cache for 5 minutes
          tags: [`user-${steamId}-games`]
        }
      }
    );

    if (!gamesResponse.ok) {
      throw new Error("Failed to fetch games list");
    }

    const gamesData = await gamesResponse.json();
    let games: SteamGame[] = gamesData.response?.games || [];

    // Add Steam Community as a special "game" for inventory
    games.unshift({
      appid: 753,
      name: "Steam Community",
      playtime_forever: 0,
      img_icon_url: "",
      has_community_visible_stats: false,
      has_inventory: true,
    });

    // Enrich games with inventory information
    games = games.map(game => ({
      ...game,
      has_inventory: KNOWN_GAMES[game.appid as keyof typeof KNOWN_GAMES]?.hasInventory || false,
      context_id: KNOWN_GAMES[game.appid as keyof typeof KNOWN_GAMES]?.contextId,
    }));

    // Filter games if inventory_only is specified
    if (inventoryOnly) {
      games = games.filter(game => game.has_inventory);
    }

    // Sort games by playtime and inventory availability
    games.sort((a, b) => {
      // Always put Steam Community first
      if (a.appid === 753) return -1;
      if (b.appid === 753) return 1;

      // Then sort by inventory availability
      if (a.has_inventory && !b.has_inventory) return -1;
      if (!a.has_inventory && b.has_inventory) return 1;

      // Then by recent playtime
      return (b.playtime_2weeks || 0) - (a.playtime_2weeks || 0);
    });

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
      if (inventoryOnly) {
        console.log("Filtered to inventory-enabled games only");
      }
    }

    // Calculate cache duration based on whether details are included
    const cacheDuration = includeDetails ? 300 : 600; // 5 or 10 minutes

    // Create response with appropriate cache headers
    const response = NextResponse.json({
      success: true,
      games,
      total_count: games.length,
    });

    // Set cache control headers
    response.headers.set(
      'Cache-Control',
      `s-maxage=${cacheDuration}, stale-while-revalidate`
    );

    // Set cache tag header for Vercel or similar edge caching
    response.headers.set(
      'x-cache-tags',
      `user-${steamId}-games${includeDetails ? ',user-games-details' : ''}`
    );

    return response;
  } catch (error) {
    console.error("Games API error:", error);
    const errorResponse = NextResponse.json(
      {
        success: false,
        error: "Failed to fetch games",
        details: config.isDev ? (error as Error).message : undefined,
        games: [],
        total_count: 0,
      },
      { status: 500 }
    );

    // Set no-cache for error responses
    errorResponse.headers.set('Cache-Control', 'no-store');
    
    return errorResponse;
  }
}
