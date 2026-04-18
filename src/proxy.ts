import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://192.168.15.20:3000", // para liberar o acesso fora do localhost
];

export default function proxy(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  const isAllowed = allowedOrigins.includes(origin);

  const headers = new Headers();

  if (isAllowed || origin === "null") {
    headers.set("Access-Control-Allow-Origin", origin);
  }
 
  headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Access-Control-Allow-Credentials", "true");

  // trata preflight
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers,
    });
  }

  const response = NextResponse.next();

  headers.forEach((value, key) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: "/api/:path*",
};