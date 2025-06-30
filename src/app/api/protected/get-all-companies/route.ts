import { NextResponse } from "next/server";
import { getAllCompany } from "./db";

export async function GET(req: Request) {
  try {
    const userUuid = req.headers.get("x-user-uuid");
    if (!userUuid) {
      return NextResponse.json(
        { status: false, msg: "Unauthorized access" },
        { status: 401 }
      );
    }
    const result = await getAllCompany();
    return NextResponse.json(
      {
        status: result.status,
        msg: result.msg,
        data: result.data,
      },
      { status: result.status ? 200 : 400 }
    );
  } catch (error) {
    console.error("Error Getting Company:", error);
    return NextResponse.json(
      { status: false, msg: "Internal Server Error", error },
      { status: 500 }
    );
  }
}
