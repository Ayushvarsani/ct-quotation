import { NextResponse } from "next/server";
import {
  createQuotationLabel,
  deleteCompany,
  getCompany,
  registerCompany,
  updateCompany,
  updateQuotationLabel,
} from "./db";
import { registerCustomer, updateCustomer } from "../create-customer/db";
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
    const moduleNames = Array.isArray(body.module) ? body.module : [];

    body.created_by = userUuid;
    moduleNames.forEach((modName: string) => {
      if (typeof modName === "string") {
        body[modName] = true;
      }
    });
    if (body.start_date) {
      body.start_date = new Date(body.start_date);
    }
    if (body.end_date) {
      body.end_date = new Date(body.end_date);
    }
    const result = await registerCompany(body);
    body.customer_email = body.company_email;
    body.customer_name = body.company_name;
    body.customer_email = body.company_email;
    body.customer_country_code = body.company_country_code;
    body.customer_mobile = body.company_mobile;
    body.customer_password = await hashPassword(body.company_password);
    body.customer_role = 1;
    body.company_uuid = result.data.company_uuid;
    body.created_by_admin = userUuid;
    if (moduleNames.includes("quotation_module")) {
      await createQuotationLabel(body);
    }
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
    const moduleNames = Array.isArray(body.module) ? body.module : [];
    moduleNames.forEach((modName: string) => {
      if (typeof modName === "string") {
        body[modName] = true;
      }
    });
    const { searchParams } = new URL(req.url);
    const company_uuid = searchParams.get("company_uuid");
    body.company_uuid = company_uuid;
    body.created_by = userUuid;
    if (body.start_date) {
      body.start_date = new Date(body.start_date);
    }
    if (body.end_date) {
      body.end_date = new Date(body.end_date);
    }
    const result = await updateCompany(body);
    body.customer_email = body.company_email;
    body.customer_name = body.company_name;
    body.customer_email = body.company_email;
    body.customer_country_code = body.company_country_code;
    body.customer_mobile = body.company_mobile;
    body.customer_role = 1;
    if (body.company_password) {
      body.customer_password = await hashPassword(body.company_password);
    }
    body.company_uuid = result.data.company_uuid;
    body.created_by_admin = userUuid;
    if (body.quotation_module) {
      await updateQuotationLabel(body);
    }
    await updateCustomer(body);
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
    const a: string[] = [];
    const result = await getCompany(String(company_uuid));
    if (result.data.quotation_module) {
      a.push("quotation_module");
    }
    if (result.data.bussiness_card_module) {
      a.push("bussiness_card_module");
    }
    result.data.module = a;
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
    const company_uuid = searchParams.get("company_uuid");
    const result = await deleteCompany(String(company_uuid));
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
