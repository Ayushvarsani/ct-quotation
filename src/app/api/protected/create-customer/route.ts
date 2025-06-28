import { NextResponse } from "next/server";
import { registerCustomer } from "./db";
import { hashPassword } from "../../utils/passwordGenerator";
import { DatabaseError } from "pg";

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
    body.customer_password = await hashPassword(body.customer_password);
    body.customer_role = 1;
    body.company_uuid = company_uuid;
    body.created_by_admin = userUuid;
    const result = await registerCustomer(body);
    return NextResponse.json(
      {
        status: result.status,
        msg: result.msg,
        data: result.data,
      },
      { status: result.status ? 200 : 400 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);
    if (error instanceof Error && (error as DatabaseError).code) {
      const dbError = error as DatabaseError;

      if (dbError.code === "23505") {
        return NextResponse.json(
          {
            status: false,
            msg: "Email or mobile already linked with another user",
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { status: false, msg: "Internal Server Error", error },
        { status: 500 }
      );
    }
  }
}
