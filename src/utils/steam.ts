import { NextRequest } from "next/server";
import { config } from "~/config/env";
import type { SteamUser } from "~/types/steam";

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
