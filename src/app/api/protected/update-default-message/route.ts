import { NextRequest, NextResponse } from "next/server";
import { updateDefaultMessageNumber } from "./db";
import { authMiddleware } from "../../utils/authMiddleWare";

export async function POST(request: NextRequest) {
  try {
    // Apply authentication middleware
    const authResult = await authMiddleware(request);
    if (!authResult.status) {
      return NextResponse.json(
        { status: false, msg: authResult.msg },
        { status: 401 }
      );
    }

    // Call the database function
    const result = await updateDefaultMessageNumber(request);

    if (result.status) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Error in update-default-message route:", error);
    return NextResponse.json(
      { status: false, msg: "Internal server error" },
      { status: 500 }
    );
  }
} 