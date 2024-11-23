import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { paths } = await request.json();

    if (!Array.isArray(paths)) {
      return NextResponse.json(
        { error: "paths must be an array" },
        { status: 400 }
      );
    }

    // Revalidate each path
    for (const path of paths) {
      revalidatePath(path);
    }

    return NextResponse.json({ revalidated: true, paths });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      { error: "Failed to revalidate paths" },
      { status: 500 }
    );
  }
}
