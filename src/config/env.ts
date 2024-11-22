const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
};

export const STEAM_API_ENDPOINTS = {
  // User & Authentication
  playerSummaries: "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/",
  friendsList: "https://api.steampowered.com/ISteamUser/GetFriendList/v1/",
  userStats: "https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2/",

  // Games & Apps
  ownedGames: "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/",
  recentlyPlayed: "https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/",
  gameSchema: "https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/",
  gameNews: "https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/",
  achievements: "https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/",

  // Files & Content
  queryFiles: "https://api.steampowered.com/IPublishedFileService/QueryFiles/v1/",
  fileDetails: "https://api.steampowered.com/IPublishedFileService/GetDetails/v1/",

  // Community
  communityScreenshots: "https://steamcommunity.com/profiles/{steamid}/screenshots",
  communityApi: "https://community.steam-api.com",
} as const;

export const STEAM_FILE_TYPES = {
  ITEMS: 0,
  COLLECTIONS: 1,
  ART: 2,
  VIDEOS: 3,
  SCREENSHOTS: 4,
  COLLECTION_ELIGIBLE: 5,
  GUIDES: 10,
  WORKSHOP_ITEMS: 17,
} as const;

export const STEAM_QUERY_TYPES = {
  RANKED_BY_VOTE: 0,
  RANKED_BY_DATE: 1,
  RANKED_BY_TREND: 3,
  FRIENDS_FAVORITES: 4,
  FRIENDS_CREATED: 5,
  FOLLOWED_USERS: 7,
} as const;

export const STEAM_VISIBILITY = {
  PRIVATE: 0,
  FRIENDS_ONLY: 1,
  PUBLIC: 2,
} as const;

// Use production URLs for Steam API even in development
const PROD_URL = "https://steamshare.net";

export const config = {
  env: process.env.NODE_ENV || "development",
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
  app: {
    name: "SteamShare",
    description: "Steam Screenshot Gallery",
    url: getEnvVar("NEXT_PUBLIC_APP_URL"),
    apiUrl: getEnvVar("NEXT_PUBLIC_API_URL"),
  },
  steam: {
    apiKey: getEnvVar("STEAM_API_KEY"),
    communityToken: getEnvVar("STEAM_COMMUNITY_TOKEN"),
    // Use production URLs for Steam API configuration
    get realm() {
      return PROD_URL;
    },
    get returnUrl() {
      // Use production URL for Steam API configuration
      return `${PROD_URL}/api/auth/steam/return`;
    },
    openIdUrl: "https://steamcommunity.com/openid",
    endpoints: STEAM_API_ENDPOINTS,
    fileTypes: STEAM_FILE_TYPES,
    queryTypes: STEAM_QUERY_TYPES,
    visibility: STEAM_VISIBILITY,
  },
} as const;

// Type-safe environment helpers
export function getBaseUrl(): string {
  return config.app.url;
}

export function getApiUrl(): string {
  return config.app.apiUrl;
}

export function getSteamConfig() {
  return config.steam;
}

// Validate required environment variables
export function validateEnv() {
  const required = [
    "NEXT_PUBLIC_APP_URL",
    "NEXT_PUBLIC_API_URL",
    "STEAM_API_KEY",
    "STEAM_COMMUNITY_TOKEN",
    "NODE_ENV",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  // Validate URLs
  try {
    new URL(config.app.url);
    new URL(config.app.apiUrl);
  } catch (_) {
    throw new Error("Invalid URL in environment configuration");
  }
}

// Helper to get full URL for API endpoints
export function getFullApiUrl(path: string): string {
  return `${config.app.apiUrl}${path}`;
}

// Helper to get full URL for pages
export function getFullPageUrl(path: string): string {
  return `${config.app.url}${path}`;
}

// Helper to get Steam API URL with key
export function getSteamApiUrl(
  endpoint: keyof typeof STEAM_API_ENDPOINTS,
  params: Record<string, string> = {}
): string {
  const url = new URL(STEAM_API_ENDPOINTS[endpoint]);
  url.searchParams.append("key", config.steam.apiKey);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  return url.toString();
}

// Helper to get Steam Community URL with token
export function getSteamCommunityUrl(
  endpoint: keyof typeof STEAM_API_ENDPOINTS,
  steamId: string,
  params: Record<string, string> = {}
): string {
  const baseUrl = STEAM_API_ENDPOINTS[endpoint].replace("{steamid}", steamId);
  const url = new URL(baseUrl);

  url.searchParams.append("access_token", config.steam.communityToken);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  return url.toString();
}

// Log configuration in development
if (config.isDev) {
  console.log("Environment Configuration:", {
    env: config.env,
    appUrl: config.app.url,
    apiUrl: config.app.apiUrl,
    steamReturnUrl: config.steam.returnUrl,
  });
}
