import { NextRequest, NextResponse } from "next/server";

import { config } from "~/config/env";
import type { SteamUser } from "~/types/steam";
import { validateSteamSession } from "~/utils/steam";

async function getSteamUserData(steamId: string): Promise<SteamUser | null> {
  try {
    const response = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${config.steam.apiKey}&steamids=${steamId}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch Steam user data: ${response.status}`);
    }

    const data = await response.json();
    const userData = data.response?.players?.[0];

    if (!userData) {
      throw new Error("No user data returned from Steam API");
    }

    return userData;
  } catch (error) {
    console.error("Error fetching Steam user data:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get("openid.mode");

    if (mode !== "id_res") {
      throw new Error("Invalid OpenID response mode");
    }

    // Extract Steam ID from claimed_id
    const claimedId = searchParams.get("openid.claimed_id");
    if (!claimedId) {
      throw new Error("No claimed ID provided");
    }

    const steamId = claimedId.split("/").pop();
    if (!steamId) {
      throw new Error("Could not extract Steam ID");
    }

    // Get user data from Steam API
    const userData = await getSteamUserData(steamId);
    if (!userData || !validateSteamSession(userData)) {
      throw new Error("Could not fetch Steam user data");
    }

    if (config.isDev) {
      console.log("Steam auth return:", {
        steamId,
        userData: {
          personaname: userData.personaname,
          profileurl: userData.profileurl,
        },
      });
    }

    // Create response with redirect
    const response = NextResponse.redirect(new URL("/steam", config.app.url));

    // Set session cookie with user data
    response.cookies.set("steam_session", JSON.stringify(userData), {
      path: "/",
      secure: config.isProd,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
    });

    return response;
  } catch (error) {
    console.error("Steam auth return error:", error);

    // Clear any existing session
    const response = NextResponse.redirect(new URL("/steam?error=auth_failed", config.app.url));
    response.cookies.set("steam_session", "", {
      expires: new Date(0),
      path: "/",
      secure: config.isProd,
      sameSite: "lax",
      httpOnly: true,
    });

    // Add error details to URL if in development
    if (config.isDev) {
      const errorUrl = new URL("/steam", config.app.url);
      errorUrl.searchParams.set("error", "auth_failed");
      errorUrl.searchParams.set("details", (error as Error).message);
      return NextResponse.redirect(errorUrl);
    }

    return response;
  }
}
