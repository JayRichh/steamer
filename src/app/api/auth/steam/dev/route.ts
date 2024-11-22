import { NextRequest, NextResponse } from "next/server";
import { config } from "~/config/env";

// Mock user data for development
const DEV_USER = {
  steamid: "76561198026821932",
  communityvisibilitystate: 3,
  profilestate: 1,
  personaname: "Dev User",
  profileurl: "https://steamcommunity.com/id/devuser/",
  avatar: "https://avatars.steamstatic.com/default.jpg",
  avatarmedium: "https://avatars.steamstatic.com/default_medium.jpg",
  avatarfull: "https://avatars.steamstatic.com/default_full.jpg",
  personastate: 1,
  realname: "Development User",
  primaryclanid: "0",
  timecreated: 1609459200,
  personastateflags: 0,
  loccountrycode: "US",
};

export async function GET(request: NextRequest) {
  // Only allow in development
  if (!config.isDev) {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const response = NextResponse.redirect(new URL("/steam", config.app.url));

  // Set development session cookie
  response.cookies.set("steam_session", JSON.stringify(DEV_USER), {
    path: "/",
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
  });

  return response;
}
