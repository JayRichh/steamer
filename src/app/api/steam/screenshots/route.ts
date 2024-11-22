import { NextRequest, NextResponse } from "next/server";

import { validateSteamSession } from "~/utils/steam";

import { config, getSteamApiUrl } from "~/config/env";
import type { SteamScreenshot, SteamScreenshotsResponse } from "~/types/steam";

const ITEMS_PER_PAGE = 12;

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

    if (!steamId) {
      return NextResponse.json({ error: "Steam ID required" }, { status: 400 });
    }

    // If requesting friend's screenshots, verify friendship
    if (steamId !== userData.steamid) {
      const friendsResponse = await fetch(
        getSteamApiUrl("friendsList", {
          steamid: userData.steamid,
          relationship: "friend",
        })
      );

      if (!friendsResponse.ok) {
        return NextResponse.json({ error: "Failed to verify friendship" }, { status: 403 });
      }

      const friendsData = await friendsResponse.json();
      const isFriend = friendsData.friendslist?.friends?.some(
        (friend: any) => friend.steamid === steamId
      );

      if (!isFriend) {
        return NextResponse.json(
          { error: "Not authorized to view these screenshots" },
          { status: 403 }
        );
      }
    }

    // Fetch screenshots using GetUserFiles with parameters for full details
    const params = new URLSearchParams({
      key: config.steam.apiKey,
      steamid: steamId,
      appid: "0", // All apps
      numperpage: "1000", // Maximum items per page
      filetype: "4", // Screenshots file type
      return_vote_data: "true",
      return_tags: "true",
      return_kv_tags: "true", // Get key-value tags for additional metadata
      return_previews: "true",
      return_children: "false",
      return_short_description: "true",
      return_for_sale_data: "false",
      return_metadata: "true",
      strip_description_bbcode: "true",
      required_kv_tags: "{}",
      creator_appid: "0", // All apps
      match_cloud_filename: "",
      admin_query: "false",
      return_details: "true", // Get full details
      get_full_file_url: "true", // Ensure we get full file URLs
    });

    const apiUrl = `https://api.steampowered.com/IPublishedFileService/GetUserFiles/v1/?${params.toString()}`;
    console.log("\n[Steam API Request]");
    console.log("URL:", apiUrl);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Steam API error response:", errorText);
      throw new Error(`Steam API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.response) {
      console.warn("No response object in data");
      throw new Error("Invalid API response structure");
    }

    // Get the files array from the correct path
    const files = data.response.publishedfiledetails || [];
    console.log(`Found ${files.length} files`);

    // Transform the response to match our type
    const allScreenshots = files
      .filter((file: any) => {
        const url = file.url || file.file_url || file.preview_url;
        const isValidUrl = url && url.includes("steamuserimages-a.akamaihd.net/ugc/");
        return isValidUrl;
      })
      .map((file: any) => {
        const filePath = file.filename || "";
        const fileNameMatch = filePath.match(/\/([^/]+)$/);
        const fileName = fileNameMatch ? fileNameMatch[1] : "Screenshot";
        const gameName = filePath.split("/")[0] || "Unknown Game";

        const fullUrl = file.file_url || file.url || "";
        const finalUrl = fullUrl.includes("?")
          ? fullUrl
          : `${fullUrl}/?imw=5000&imh=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false`;

        const thumbnailUrl =
          file.preview_url ||
          `${fullUrl}/?imw=512&imh=512&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false`;

        const width = parseInt(file.width || file.preview_width || "0", 10);
        const height = parseInt(file.height || file.preview_height || "0", 10);

        const title = file.title && file.title !== filePath ? file.title : `${gameName} Screenshot`;

        const screenshot: SteamScreenshot = {
          id: parseInt(file.publishedfileid, 10),
          appid: parseInt(file.consumer_app_id || file.creator_app_id || file.app_id || 0, 10),
          filename: fileName,
          filesize: parseInt(file.file_size, 10) || 0,
          width: width || 1920,
          height: height || 1080,
          creation_time: parseInt(file.time_created, 10),
          upvotes: parseInt(file.vote_data?.votes_up || 0, 10),
          spoiler: Boolean(file.spoiler_tag || file.flags?.spoiler),
          title: title,
          caption: file.description || file.short_description || "",
          url: finalUrl,
          thumbnail_url: thumbnailUrl,
          privacy: file.visibility === 0 ? "private" : file.visibility === 1 ? "friends" : "public",
        };

        return screenshot;
      });

    // Sort by creation time, newest first
    allScreenshots.sort(
      (a: SteamScreenshot, b: SteamScreenshot) => b.creation_time - a.creation_time
    );

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const screenshots = allScreenshots.slice(startIndex, endIndex);

    const result: SteamScreenshotsResponse = {
      success: true,
      screenshots,
      total_count: allScreenshots.length,
      page,
      limit,
      total_pages: Math.ceil(allScreenshots.length / limit),
    };

    console.log(`Successfully mapped ${screenshots.length} screenshots for page ${page}`);
    return NextResponse.json(result);
  } catch (error) {
    console.error("\n[Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch screenshots",
        details: config.isDev ? (error as Error).message : undefined,
        screenshots: [],
        total_count: 0,
        page: 1,
        limit: ITEMS_PER_PAGE,
        total_pages: 0,
      },
      { status: 500 }
    );
  }
}
