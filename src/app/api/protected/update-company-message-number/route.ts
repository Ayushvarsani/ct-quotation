import { NextResponse } from "next/server";
import { updateCompanyMessageNumber } from "./db";

export async function PUT(req: Request) {
  try {
    const userUuid = req.headers.get("x-user-uuid");
    if (!userUuid) {
      return NextResponse.json(
        { status: false, msg: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Get company_uuid from query parameters
    const { searchParams } = new URL(req.url);
    const company_uuid = searchParams.get("company_uuid");

    if (!company_uuid) {
      return NextResponse.json(
        { status: false, msg: "Company UUID is required" },
        { status: 400 }
      );
    }

    // Get the new message number from request body
    const body = await req.json();
    const { company_message_number } = body;

    if (!company_message_number) {
      return NextResponse.json(
        { status: false, msg: "Company message number is required" },
        { status: 400 }
      );
    }

    const result = await updateCompanyMessageNumber({
      company_uuid,
      company_message_number,
    });
    
    return NextResponse.json(
      {
        status: result.status,
        msg: result.msg,
        data: result.data,
      },
      { status: result.status ? 200 : result.code }
    );
  } catch (error) {
    console.error("Error updating company message number:", error);
    return NextResponse.json(
      { status: false, msg: "Internal Server Error", error },
      { status: 500 }
    );
  }
} 