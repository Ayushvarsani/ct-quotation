import { NextResponse } from "next/server";
import { registerAdmin } from "./db";
import { hashPassword } from "../utils/passwordGenerator";
import { DatabaseError } from "pg";

interface AdminRegisterRequest {
  admin_name: string;
  admin_email: string;
  admin_password: string;
  admin_country_code: string;
  admin_mobile: string;
}

export async function POST(req: Request) {
  try {
    const body: AdminRegisterRequest = await req.json();

    const hashedPassword = await hashPassword("Admin@1234");

    const adminData = await registerAdmin({
      ...body,
      admin_password: hashedPassword,
    });

    return NextResponse.json(
      {
        status: adminData.status,
        msg: adminData.msg,
        data: adminData.data,
      },
      { status: adminData.status ? 200 : 400 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);
    if (error instanceof Error && (error as DatabaseError).code) {
      const dbError = error as DatabaseError;

      if (dbError.code === "23505") {
        return NextResponse.json(
          {
            status: false,
            msg: "Email or mobile already linked with another admin",
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
