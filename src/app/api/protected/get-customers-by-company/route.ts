import { NextResponse } from "next/server";
import { getCustomersByCompany } from "./db";

export async function GET(req: Request) {
  try {
    const userUuid = req.headers.get("x-user-uuid");
    if (!userUuid) {
      return NextResponse.json(
        { status: false, msg: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Get customer_uuid from query parameters
    const { searchParams } = new URL(req.url);
    const customer_uuid = searchParams.get("customer_uuid");

    if (!customer_uuid) {
      return NextResponse.json(
        { status: false, msg: "Company UUID is required" },
        { status: 400 }
      );
    }

    const result = await getCustomersByCompany({ customer_uuid });
    
    return NextResponse.json(
      {
        status: result.status,
        msg: result.msg,
        data: result.data,
      },
      { status: result.status ? 200 : 400 }
    );
  } catch (error) {
    console.error("Error Getting Customers by Company:", error);
    return NextResponse.json(
      { status: false, msg: "Internal Server Error", error },
      { status: 500 }
    );
  }
}
