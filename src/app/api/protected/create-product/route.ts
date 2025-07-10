import { NextResponse } from "next/server";
import {
  deleteProduct,
  getQuotationProduct,
  registerQuotationProduct,
  updateQuotationProduct,
} from "./db";

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
    body.customer_uuid = userUuid;
    const result = await registerQuotationProduct(body);
    return NextResponse.json(
      {
        status: result.status,
        msg: result.msg,
        data: result.data,
      },
      { status: result.status ? 200 : 400 }
    );
  } catch (error) {
    console.error("Error Adding company:", error);
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
    const result = await getQuotationProduct(String(company_uuid));
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
    const { searchParams } = new URL(req.url);
    const product_uuid = searchParams.get("product_uuid");

    const body = await req.json();
    body.product_uuid = product_uuid;
    body.customer_uuid = userUuid;

    const result = await updateQuotationProduct(body);
    return NextResponse.json(
      {
        status: result.status,
        msg: result.msg,
        data: result.data,
      },
      { status: result.status ? 200 : 400 }
    );
  } catch (error) {
    console.error("Error Updating Product:", error);
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
    const product_uuid = searchParams.get("product_uuid");

    const result = await deleteProduct(String(product_uuid));
    return NextResponse.json(
      {
        status: result.status,
        msg: result.msg,
        data: result.data,
      },
      { status: result.status ? 200 : 400 }
    );
  } catch (error) {
    console.error("Error Deleting Product:", error);
    return NextResponse.json(
      { status: false, msg: "Internal Server Error", error },
      { status: 500 }
    );
  }
}
