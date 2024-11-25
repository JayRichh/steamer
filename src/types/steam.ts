export interface SteamUser {
  steamid: string;
  communityvisibilitystate: number;
  profilestate: number;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  lastlogoff: number;
  personastate: number;
  primaryclanid?: string;
  timecreated?: number;
  personastateflags?: number;
  loccountrycode?: string;
  gameextrainfo?: string;
  gameid?: string;
}

export interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url: string;
  img_logo_url?: string;
  playtime_2weeks?: number;
  has_community_visible_stats: boolean;
  has_leaderboards?: boolean;
  has_inventory?: boolean;
  context_id?: string;
  stats?: GameStats;
  achievements?: GameAchievement[];
}

export interface GameStats {
  name: string;
  value: number;
}

export interface GameAchievement {
  apiname: string;
  achieved: number;
  unlocktime: number;
  name: string;
  description: string;
}

export interface GameNews {
  gid: string;
  title: string;
  url: string;
  author: string;
  contents: string;
  feedlabel: string;
  date: number;
  feedname: string;
  feed_type: number;
  appid: number;
}

export interface SteamFriend {
  steamid: string;
  relationship: string;
  friend_since: number;
  personaname?: string;
  profileurl?: string;
  avatar?: string;
  avatarmedium?: string;
  avatarfull?: string;
  personastate?: number;
  gameextrainfo?: string;
  gameid?: string;
  realname?: string;
  gamename?: string;
  gameserverip?: string;
  lobbysteamid?: string;
}

export interface SteamScreenshot {
  id: number;
  appid: number;
  filename: string;
  filesize: number;
  width: number;
  height: number;
  creation_time: number;
  upvotes: number;
  spoiler: boolean;
  title: string;
  caption: string;
  url: string;
  thumbnail_url: string;
  privacy: "public" | "private" | "friends";
}

export interface SteamInventoryItem {
  appid: number;
  contextid: string;
  assetid: string;
  classid: string;
  instanceid: string;
  amount: string;
  pos: number;
  name: string;
  market_hash_name: string;
  market_name: string;
  name_color?: string;
  background_color?: string;
  type: string;
  tradable: number;
  marketable: number;
  commodity: number;
  market_tradable_restriction: number;
  descriptions: {
    type: string;
    value: string;
    color?: string;
  }[];
  actions?: {
    name: string;
    link: string;
  }[];
  market_actions?: {
    name: string;
    link: string;
  }[];
  tags: {
    category: string;
    internal_name: string;
    localized_category_name: string;
    localized_tag_name: string;
    color?: string;
  }[];
  icon_url: string;
  icon_url_large?: string;
}

// API Response Types
export interface SteamPlayerSummary {
  response: {
    players: SteamUser[];
  };
}

export interface SteamOwnedGames {
  response: {
    game_count: number;
    games: SteamGame[];
  };
}

export interface SteamGameNews {
  appnews: {
    appid: number;
    newsitems: GameNews[];
    count: number;
  };
}

export interface SteamGameAchievements {
  playerstats: {
    steamID: string;
    gameName: string;
    achievements: GameAchievement[];
    success: boolean;
  };
}

export interface SteamGameStats {
  playerstats: {
    steamID: string;
    gameName: string;
    stats: GameStats[];
    achievements: GameAchievement[];
  };
}

// Response Types for our API endpoints
export interface SteamLoginResponse {
  success: boolean;
  user?: SteamUser;
  error?: string;
}

export interface SteamFriendsResponse {
  success: boolean;
  friends: SteamFriend[];
  total_count: number;
  page?: number;
  limit?: number;
  total_pages?: number;
  error?: string;
}

export interface SteamScreenshotsResponse {
  success: boolean;
  screenshots: SteamScreenshot[];
  total_count: number;
  page?: number;
  limit?: number;
  total_pages?: number;
  error?: string;
}

export interface SteamGamesResponse {
  success: boolean;
  games: SteamGame[];
  total_count: number;
  error?: string;
}

export interface SteamGameDetailsResponse {
  success: boolean;
  game: SteamGame;
  news?: GameNews[];
  achievements?: GameAchievement[];
  stats?: GameStats[];
  error?: string;
}

export interface SteamInventoryResponse {
  success: boolean;
  items: SteamInventoryItem[];
  total_count: number;
  page?: number;
  limit?: number;
  total_pages?: number;
  error?: string;
}

// Steam persona states
export const STEAM_PERSONA_STATES = {
  OFFLINE: 0,
  ONLINE: 1,
  BUSY: 2,
  AWAY: 3,
  SNOOZE: 4,
  LOOKING_TO_TRADE: 5,
  LOOKING_TO_PLAY: 6,
  INVISIBLE: 7,
} as const;

export type SteamPersonaState = (typeof STEAM_PERSONA_STATES)[keyof typeof STEAM_PERSONA_STATES];

export function getPersonaStateText(state: SteamPersonaState): string {
  switch (state) {
    case STEAM_PERSONA_STATES.ONLINE:
      return "Online";
    case STEAM_PERSONA_STATES.BUSY:
      return "Busy";
    case STEAM_PERSONA_STATES.AWAY:
      return "Away";
    case STEAM_PERSONA_STATES.SNOOZE:
      return "Snooze";
    case STEAM_PERSONA_STATES.LOOKING_TO_TRADE:
      return "Looking to Trade";
    case STEAM_PERSONA_STATES.LOOKING_TO_PLAY:
      return "Looking to Play";
    case STEAM_PERSONA_STATES.INVISIBLE:
      return "Invisible";
    default:
      return "Offline";
  }
}

export function getPersonaStateColor(state: SteamPersonaState): string {
  switch (state) {
    case STEAM_PERSONA_STATES.ONLINE:
      return "text-green-500";
    case STEAM_PERSONA_STATES.BUSY:
      return "text-red-500";
    case STEAM_PERSONA_STATES.AWAY:
      return "text-yellow-500";
    case STEAM_PERSONA_STATES.SNOOZE:
      return "text-purple-500";
    case STEAM_PERSONA_STATES.LOOKING_TO_TRADE:
      return "text-blue-500";
    case STEAM_PERSONA_STATES.LOOKING_TO_PLAY:
      return "text-blue-500";
    case STEAM_PERSONA_STATES.INVISIBLE:
      return "text-gray-500";
    default:
      return "text-gray-500";
  }
}
