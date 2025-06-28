import { NextResponse } from "next/server";
import { registerCompany } from "./db";
import { registerCustomer } from "../create-customer/db";
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
    const body = await req.json();
    body.created_by = userUuid;
    const result = await registerCompany(body);
    body.customer_email = body.company_email;
    body.customer_name = body.company_name;
    body.customer_email = body.company_email;
    body.customer_country_code = body.company_country_code;
    body.customer_mobile = body.company_mobile;
    body.customer_password = await hashPassword("Admin@1234");
    body.customer_role = 1;
    body.company_uuid = result.data.company_uuid;
    body.created_by_admin = userUuid;

    await registerCustomer(body);
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
            msg: "Email or mobile already linked with another company",
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
