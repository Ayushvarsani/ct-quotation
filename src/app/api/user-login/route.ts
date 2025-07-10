import { NextResponse } from "next/server";
import { loginUser, updateUserToken } from "./db";
import { comparePassword } from "../utils/passwordGenerator";
import { generateToken } from "../utils/authMiddleWare";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const user_data = await loginUser(email);
    console.log(user_data);
    if (user_data.data && user_data.data.status === "INACTIVE") {
      return NextResponse.json(
        { status: false, msg: `Contact Admin To Reactivate Your Account` },
        { status: 401 }
      );
    }
    console.log(user_data);
    if (user_data.status === false) {
      return NextResponse.json(
        { status: false, msg: `User Not Found` },
        { status: 401 }
      );
    }
    const hashedPassword = await comparePassword(
      password,
      user_data.data.customer_password
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
    const jwt_token = await generateToken(user_data.data.customer_uuid);
    user_data.data.jwt_token = jwt_token;
    await updateUserToken(email, jwt_token);
    return NextResponse.json(
      {
        status: true,
        msg: user_data.msg,
        data: user_data.data,
      },
      { status: user_data.code }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { status: false, message: `Internal server error ${error}` },
      { status: 500 }
    );
  }
}
