import { NextRequest, NextResponse } from "next/server";

import { config } from "~/config/env";

export async function GET(_request: NextRequest) {
  try {
    // In development, redirect to dev auth endpoint
    if (config.isDev) {
      return NextResponse.redirect(new URL("/api/auth/steam/dev", config.app.url));
    }

    // Production Steam login flow
    const params = new URLSearchParams({
      "openid.ns": "http://specs.openid.net/auth/2.0",
      "openid.mode": "checkid_setup",
      "openid.return_to": config.steam.returnUrl,
      "openid.realm": config.steam.realm,
      "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
      "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    });

    // Redirect to Steam login
    const loginUrl = `${config.steam.openIdUrl}/login?${params.toString()}`;

    if (config.isDev) {
      console.log("Steam login URL:", loginUrl);
      console.log("Environment:", {
        realm: config.steam.realm,
        returnUrl: config.steam.returnUrl,
        isDev: config.isDev,
        isProd: config.isProd,
      });
    }

    return NextResponse.redirect(loginUrl);
  } catch (error) {
    console.error("Steam auth error:", error);
    return NextResponse.redirect(new URL("/steam?error=auth_failed", config.app.url));
  }
}

export async function POST(_request: NextRequest) {
  try {
    // Create response with expired cookie to handle logout
    const response = NextResponse.json({ success: true });

    // Set an expired cookie to clear the session
    response.cookies.set("steam_session", "", {
      expires: new Date(0),
      path: "/",
      secure: config.isProd,
      sameSite: "lax",
      httpOnly: true,
    });

    if (config.isDev) {
      console.log("User logged out successfully");
    }

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      {
        error: "Logout failed",
        details: config.isDev ? (error as Error).message : undefined,
      },
      { status: 500 }
    );
  }
}
