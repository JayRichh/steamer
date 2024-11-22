import { NextRequest, NextResponse } from "next/server";

import { config } from "~/config/env";
import type { SteamUser } from "~/types/steam";

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("steam_session");

    if (!sessionCookie?.value) {
      if (config.isDev) {
        console.log("No steam_session cookie found");
      }
      return NextResponse.json({ isLoggedIn: false }, { status: 401 });
    }

    try {
      const userData = JSON.parse(sessionCookie.value) as SteamUser;
      if (!validateSteamSession(userData)) {
        throw new Error("Invalid session data");
      }

      if (config.isDev) {
        console.log("Valid steam session found:", {
          username: userData.personaname,
          steamId: userData.steamid,
        });
      }

      // Get fresh user data from Steam API
      const response = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${config.steam.apiKey}&steamids=${userData.steamid}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }

      const data = await response.json();
      const freshUserData = data.response?.players?.[0];

      if (!freshUserData) {
        throw new Error("No user data returned from Steam API");
      }

      // Update session with fresh data
      const updatedResponse = NextResponse.json({
        isLoggedIn: true,
        user: freshUserData,
      });

      // Set updated session cookie
      updatedResponse.cookies.set("steam_session", JSON.stringify(freshUserData), {
        path: "/",
        secure: config.isProd,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
      });

      return updatedResponse;
    } catch (error) {
      // Invalid session data
      console.error("Invalid session data:", error);

      // Clear invalid session cookie
      const response = NextResponse.json({ isLoggedIn: false }, { status: 401 });
      response.cookies.set("steam_session", "", {
        expires: new Date(0),
        path: "/",
        secure: config.isProd,
        sameSite: "lax",
        httpOnly: true,
      });

      return response;
    }
  } catch (error) {
    console.error("Error getting user data:", error);
    return NextResponse.json(
      {
        error: "Failed to get user data",
        details: config.isDev ? (error as Error).message : undefined,
      },
      { status: 500 }
    );
  }
}

// Helper function to validate Steam session
export function validateSteamSession(sessionData: any): sessionData is SteamUser {
  const requiredFields = [
    "steamid",
    "personaname",
    "profileurl",
    "avatar",
    "avatarmedium",
    "avatarfull",
  ];

  const isValid =
    typeof sessionData === "object" &&
    sessionData !== null &&
    requiredFields.every((field) => {
      const hasField = field in sessionData;
      const isString = typeof sessionData[field] === "string";

      if (config.isDev && (!hasField || !isString)) {
        console.log(`Invalid session field: ${field}`, {
          hasField,
          type: typeof sessionData[field],
        });
      }

      return hasField && isString;
    });

  if (config.isDev) {
    console.log("Session validation result:", {
      isValid,
      sessionData: isValid
        ? {
            steamid: sessionData.steamid,
            personaname: sessionData.personaname,
          }
        : "Invalid",
    });
  }

  return isValid;
}

// Helper function to get user from session
export function getUserFromSession(request: NextRequest) {
  try {
    const cookieHeader = request.cookies.get("steam_session");

    if (!cookieHeader?.value) {
      if (config.isDev) {
        console.log("No session cookie found in getUserFromSession");
      }
      return null;
    }

    const userData = JSON.parse(cookieHeader.value) as SteamUser;
    return validateSteamSession(userData) ? userData : null;
  } catch (error) {
    console.error("Error getting user from session:", error);
    return null;
  }
}
