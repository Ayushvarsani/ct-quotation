import { NextResponse } from "next/server";
import {
  deleteCustomer,
  getCustomer,
  registerCustomer,
  updateCustomer,
} from "./db";
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
    const moduleNames = Array.isArray(body.module) ? body.module : [];
    moduleNames.forEach((modName: string) => {
      if (typeof modName === "string") {
        body[modName] = true;
      }
    });
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
export async function PUT(req: Request) {
  try {
    const userUuid = req.headers.get("x-user-uuid");
    if (!userUuid) {
      return NextResponse.json(
        { status: false, msg: "Unauthorized access" },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(req.url);
    const customer_uuid = searchParams.get("customer_uuid");
    const body = await req.json();
    const moduleNames = Array.isArray(body.module) ? body.module : [];
    moduleNames.forEach((modName: string) => {
      if (typeof modName === "string") {
        body[modName] = true;
      }
    });
    if (body.customer_password) {
      body.customer_password = await hashPassword(body.customer_password);
    }
    body.customer_uuid = customer_uuid;
    const result = await updateCustomer(body);
    return NextResponse.json(
      {
        status: result.status,
        msg: result.msg,
        data: result.data,
      },
      { status: result.status ? 200 : 400 }
    );
  } catch (error: unknown) {
    console.error("Updation error:", error);
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
    const customer_uuid = searchParams.get("customer_uuid");

    const result = await getCustomer(String(customer_uuid));
    return NextResponse.json(
      {
        status: result.status,
        msg: result.msg,
        data: result.data,
      },
      { status: result.status ? 200 : 400 }
    );
  } catch (error: unknown) {
    console.error("Updation error:", error);
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
export async function DELETE(req: Request) {
  try {
    const userUuid = req.headers.get("x-user-uuid");

    if (!userUuid) {
      return NextResponse.json(
        { status: false, msg: "Unauthorized access" },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(req.url);
    const customer_uuid = searchParams.get("customer_uuid");
    const result = await deleteCustomer(String(customer_uuid));
    return NextResponse.json(
      {
        status: result.status,
        msg: result.msg,
        data: result.data,
      },
      { status: result.status ? 200 : 400 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { status: false, msg: "Internal Server Error", error },
      { status: 500 }
    );
  }
}
