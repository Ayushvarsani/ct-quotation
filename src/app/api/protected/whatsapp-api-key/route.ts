import { NextResponse } from "next/server";
import { getWhatsAppApiKey, updateWhatsAppApiKey } from "./db";

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

    if (!company_uuid) {
      return NextResponse.json(
        { status: false, msg: "Company UUID is required" },
        { status: 400 }
      );
    }

    const result = await getWhatsAppApiKey(company_uuid);

    return NextResponse.json(
      {
        status: result.status,
        msg: result.msg,
        data: result.data,
      },
      { status: result.status ? 200 : result.code }
    );
  } catch (error: unknown) {
    console.error("Error getting WhatsApp API key:", error);    
    return NextResponse.json(
      { status: false, msg: "Internal Server Error", error },
      { status: 500 }
    );
  }
}

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

    if (!company_uuid) {
      return NextResponse.json(
        { status: false, msg: "Company UUID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { whatsapp_api_key } = body;

    if (!whatsapp_api_key) {
      return NextResponse.json(
        { status: false, msg: "WhatsApp API key is required" },
        { status: 400 }
      );
    }

    const result = await updateWhatsAppApiKey({
      company_uuid,
      whatsapp_api_key,
    });

    return NextResponse.json(
      {
        status: result.status,
        msg: result.msg,
        data: result.data,
      },
      { status: result.status ? 200 : result.code }
    );
  } catch (error: unknown) {
    console.error("Error updating WhatsApp API key:", error);
    return NextResponse.json(
      { status: false, msg: "Internal Server Error", error },
      { status: 500 }
    );
  }
} 