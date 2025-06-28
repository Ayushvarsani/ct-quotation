import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export interface JwtPayloadWithUser {
  userUuid: string;
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_TOKEN_KEY);

export async function middleware(req: NextRequest) {
  const authHeader = req.headers.get("x-auth-token");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { message: "Unauthorized: No token provided" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    console.log(await jwtVerify(token, JWT_SECRET));
    if (!payload?.userUuid) {
      return NextResponse.json(
        { message: "Unauthorized: Invalid token payload" },
        { status: 401 }
      );
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-uuid", payload.userUuid as string);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Unauthorized: Invalid token" },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: ["/api/protected/:path*"],
};
