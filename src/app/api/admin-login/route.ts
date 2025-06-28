import { NextResponse } from "next/server";
import { loginAdmin, updateAdminToken } from "./db";
import { comparePassword } from "../utils/passwordGenerator";
import { generateToken } from "../utils/authMiddleWare";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const admin_data = await loginAdmin(email);
    if (admin_data.status === false) {
      return NextResponse.json(
        { status: false, msg: `Admin Not Found` },
        { status: 401 }
      );
    }
    const hashedPassword = await comparePassword(
      password,
      admin_data.data.admin_password
    );
    if (!hashedPassword) {
      return NextResponse.json(
        {
          status: false,
          message: "Invalid Password",
        },
        { status: 401 }
      );
    }
    const jwt_token = generateToken(admin_data.data.admin_uuid);
    admin_data.data.jwt_token = jwt_token;
    await updateAdminToken(email, jwt_token);
    return NextResponse.json(
      {
        status: true,
        msg: admin_data.msg,
        data: admin_data.data,
      },
      { status: admin_data.code }
    );
  } catch (error) {
    return NextResponse.json(
      { status: false, message: `Internal server error ${error}` },
      { status: 500 }
    );
  }
}
