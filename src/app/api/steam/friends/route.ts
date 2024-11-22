import { NextRequest, NextResponse } from "next/server";

import { validateSteamSession } from "~/utils/steam";
import { config } from "~/config/env";
import type { SteamFriend, SteamFriendsResponse, SteamUser } from "~/types/steam";

const ITEMS_PER_PAGE = 12;

async function getFriendDetails(steamIds: string[]): Promise<SteamUser[]> {
  if (steamIds.length === 0) return [];

  try {
    const response = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${config.steam.apiKey}&steamids=${steamIds.join(",")}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch friend details: ${response.status}`);
    }

    const data = await response.json();
    return data.response?.players || [];
  } catch (error) {
    console.error("Error fetching friend details:", error);
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

    // Get steamid and pagination params from query
    const searchParams = request.nextUrl.searchParams;
    const steamId = searchParams.get("steamid") || userData.steamid;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || String(ITEMS_PER_PAGE), 10);
    const countOnly = searchParams.get("count_only") === "true";

    if (!steamId) {
      return NextResponse.json({ error: "Steam ID required" }, { status: 400 });
    }

    // Fetch friends list using Steam's API
    const friendsResponse = await fetch(
      `https://api.steampowered.com/ISteamUser/GetFriendList/v1/?key=${config.steam.apiKey}&steamid=${steamId}&relationship=friend`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );

    // Handle private profiles
    if (friendsResponse.status === 401) {
      return NextResponse.json({
        success: true,
        friends: [],
        total_count: 0,
        page: 1,
        limit,
        total_pages: 0,
        error: "Friends list is private",
      });
    }

    if (!friendsResponse.ok) {
      throw new Error(`Failed to fetch friends list: ${friendsResponse.status}`);
    }

    const friendsData = await friendsResponse.json();
    const friendsList = friendsData.friendslist?.friends || [];
    const totalCount = friendsList.length;
    const totalPages = Math.ceil(totalCount / limit);

    // If count_only is true, return just the count information
    if (countOnly) {
      return NextResponse.json({
        success: true,
        total_count: totalCount,
        page: 1,
        limit,
        total_pages: totalPages,
        friends: [],
      });
    }

    if (config.isDev) {
      console.log(`Found ${friendsList.length} friends for user ${steamId}`);
    }

    // Get detailed info for each friend in batches of 100
    const friendIds = friendsList.map((friend: any) => friend.steamid);
    const batchSize = 100;
    const friendDetails: SteamUser[] = [];

    for (let i = 0; i < friendIds.length; i += batchSize) {
      const batch = friendIds.slice(i, i + batchSize);
      const batchDetails = await getFriendDetails(batch);
      friendDetails.push(...batchDetails);

      if (config.isDev) {
        console.log(`Fetched details for batch ${i / batchSize + 1}`);
      }
    }

    // Merge friend details with friend list data
    const allFriends: SteamFriend[] = friendsList.map((friend: any) => {
      const details = friendDetails.find((detail) => detail.steamid === friend.steamid);
      return {
        ...friend,
        ...details,
        friend_since: friend.friend_since,
      };
    });

    // Sort friends by online status and name
    allFriends.sort((a, b) => {
      // Online friends first
      if ((b.personastate || 0) !== (a.personastate || 0)) {
        return (b.personastate || 0) - (a.personastate || 0);
      }
      // Then by name
      return (a.personaname || "").localeCompare(b.personaname || "");
    });

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFriends = allFriends.slice(startIndex, endIndex);

    if (config.isDev) {
      console.log(`Returning ${paginatedFriends.length} friends for page ${page}`);
    }

    const result: SteamFriendsResponse = {
      success: true,
      friends: paginatedFriends,
      total_count: totalCount,
      page,
      limit,
      total_pages: totalPages,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Friends API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch friends",
        details: config.isDev ? (error as Error).message : undefined,
        friends: [],
        total_count: 0,
        page: 1,
        limit: ITEMS_PER_PAGE,
        total_pages: 0,
      },
      { status: 500 }
    );
  }
}
