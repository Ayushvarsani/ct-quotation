import { NextResponse } from "next/server";
import { addProductSizes, getProductSizes, updateProductSizes } from "./db";

export async function POST(req: Request) {
  try {
    const userUuid = req.headers.get("x-user-uuid");
    if (!userUuid) {
      return NextResponse.json(
        { status: false, msg: "Unauthorized access" },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(req.url);
    const company_uuid = searchParams.get("company_uuid");
    const body = await req.json();
    body.company_uuid = company_uuid;
    body.created_by = userUuid;
    const result = await addProductSizes(body);
    return NextResponse.json(
      {
        status: result.status,
        msg: result.msg,
        data: result.data,
      },
      { status: result.status ? 200 : 400 }
    );
  } catch (error) {
    console.error("Error Adding Products:", error);
    return NextResponse.json(
      { status: false, msg: "Internal Server Error", error },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const userUuid = req.headers.get("x-user-uuid");
    if (!userUuid) {
      return NextResponse.json(
        { status: false, msg: "Unauthorized access" },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(req.url);
    const company_uuid = searchParams.get("company_uuid");
    const result = await getProductSizes(String(company_uuid));
    return NextResponse.json(
      {
        status: result.status,
        msg: result.msg,
        data: result.data,
      },
      { status: result.status ? 200 : 400 }
    );
  } catch (error) {
    console.error("Error Getting Product:", error);
    return NextResponse.json(
      { status: false, msg: "Internal Server Error", error },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const userUuid = req.headers.get("x-user-uuid");
    if (!userUuid) {
      return NextResponse.json(
        { status: false, msg: "Unauthorized access" },
        { status: 401 }
      );
    }
    const body = await req.json();
    const result = await updateProductSizes(body);
    return NextResponse.json(
      {
        status: result.status,
        msg: result.msg,
        data: result.data,
      },
      { status: result.code }
    );
  } catch (error) {
    console.error("Error Updating Product Size:", error);
    return NextResponse.json(
      { status: false, msg: "Internal Server Error", error },
      { status: 500 }
    );
  }
}
