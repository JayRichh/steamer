import { NextRequest, NextResponse } from "next/server";
import { validateSteamSession } from "~/utils/steam";
import { config } from "~/config/env";
import type { SteamInventoryItem } from "~/types/steam";

interface SteamAsset {
  appid: number;
  contextid: string;
  assetid: string;
  classid: string;
  instanceid: string;
  amount: string;
}

interface SteamDescription {
  appid: number;
  classid: string;
  instanceid: string;
  name: string;
  market_hash_name: string;
  market_name: string;
  type: string;
  tradable: number;
  marketable: number;
  commodity: number;
  market_tradable_restriction: number;
  descriptions: Array<{
    type: string;
    value: string;
    color?: string;
  }>;
  actions?: Array<{
    name: string;
    link: string;
  }>;
  name_color?: string;
  background_color?: string;
  icon_url: string;
  icon_url_large?: string;
  tags: Array<{
    category: string;
    internal_name: string;
    localized_category_name: string;
    localized_tag_name: string;
    color?: string;
  }>;
}

// Type guard to ensure we have a valid inventory item
function isValidInventoryItem(item: Partial<SteamInventoryItem>): item is SteamInventoryItem {
  return !!(
    item.appid &&
    item.contextid &&
    item.assetid &&
    item.classid &&
    item.instanceid &&
    item.amount &&
    item.name &&
    item.market_hash_name &&
    item.market_name &&
    item.type &&
    typeof item.tradable === 'number' &&
    typeof item.marketable === 'number' &&
    typeof item.commodity === 'number' &&
    typeof item.market_tradable_restriction === 'number' &&
    Array.isArray(item.descriptions) &&
    Array.isArray(item.tags) &&
    item.icon_url
  );
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 100); // Cap at 100 items
    const appId = searchParams.get("appid"); // Optional game filter

    if (!steamId) {
      return NextResponse.json({ error: "Steam ID required" }, { status: 400 });
    }

    // Construct inventory URL
    const inventoryUrl = new URL(`https://steamcommunity.com/inventory/${steamId}/753/6`);
    inventoryUrl.searchParams.append("l", "english");
    inventoryUrl.searchParams.append("count", limit.toString());
    
    // Add start_assetid for pagination if not first page
    if (page > 1) {
      const startAssetId = searchParams.get("start_assetid");
      if (startAssetId) {
        inventoryUrl.searchParams.append("start_assetid", startAssetId);
      }
    }

    // Fetch inventory
    const inventoryResponse = await fetch(inventoryUrl.toString(), {
      headers: {
        'Cookie': `steamLoginSecure=${config.steam.communityToken}`,
      },
      next: { 
        revalidate: 300, // Cache for 5 minutes
        tags: [`user-${steamId}-inventory`]
      }
    });

    if (!inventoryResponse.ok) {
      throw new Error("Failed to fetch inventory");
    }

    const inventoryData = await inventoryResponse.json();
    const assets: SteamAsset[] = inventoryData.assets || [];
    const descriptions: SteamDescription[] = inventoryData.descriptions || [];
    const total = inventoryData.total_inventory_count || 0;

    // Merge assets with descriptions
    const items: SteamInventoryItem[] = assets
      .map(asset => {
        const description = descriptions.find(
          desc => desc.classid === asset.classid && desc.instanceid === asset.instanceid
        );
        if (!description) return null;

        const item: Partial<SteamInventoryItem> = {
          ...description,
          assetid: asset.assetid,
          amount: asset.amount,
          contextid: asset.contextid,
          market_hash_name: encodeURIComponent(description.market_hash_name),
        };

        return isValidInventoryItem(item) ? item : null;
      })
      .filter((item): item is SteamInventoryItem => item !== null);

    // Filter by appId if provided
    const filteredItems = appId 
      ? items.filter(item => item.appid.toString() === appId)
      : items;

    // Sort items by rarity (name_color), then by name
    filteredItems.sort((a, b) => {
      if (a.name_color && b.name_color) {
        return b.name_color.localeCompare(a.name_color);
      }
      if (a.name_color) return -1;
      if (b.name_color) return 1;
      return a.name.localeCompare(b.name);
    });

    // Calculate pagination
    const totalPages = Math.ceil(total / limit);
    const hasMore = inventoryData.more_items;
    const nextStartAssetId = inventoryData.last_assetid;

    if (config.isDev) {
      console.log(`Fetched ${filteredItems.length} inventory items for user ${steamId}`);
      if (appId) {
        console.log(`Filtered by appId: ${appId}`);
      }
    }

    // Create response with appropriate headers
    const response = NextResponse.json({
      success: true,
      items: filteredItems,
      total_count: total,
      page,
      limit,
      total_pages: totalPages,
      has_more: hasMore,
      next_start_asset_id: nextStartAssetId,
    });

    // Set cache control headers
    response.headers.set(
      'Cache-Control',
      's-maxage=300, stale-while-revalidate'
    );

    // Set cache tag header
    response.headers.set(
      'x-cache-tags',
      `user-${steamId}-inventory${appId ? `,app-${appId}-inventory` : ''}`
    );

    return response;
  } catch (error) {
    console.error("Inventory API error:", error);
    const errorResponse = NextResponse.json(
      {
        success: false,
        error: "Failed to fetch inventory",
        details: config.isDev ? (error as Error).message : undefined,
        items: [],
        total_count: 0,
      },
      { status: 500 }
    );

    // Set no-cache for error responses
    errorResponse.headers.set('Cache-Control', 'no-store');
    
    return errorResponse;
  }
}
