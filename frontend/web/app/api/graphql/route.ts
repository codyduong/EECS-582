import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const Authorization =
    request.headers
      .get("authorization")
      ?.replace(/Bearer\w*/i, "")
      .trim() || "";

  const response = await fetch("http://127.0.0.1:4000/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  return NextResponse.json(data);
}
