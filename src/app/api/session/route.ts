import { NextResponse } from "next/server";
import { getOrCreateSessionId, getSessionId } from "@/lib/session";

export async function GET() {
  const existingSessionId = await getSessionId();
  const sessionId = await getOrCreateSessionId();

  return NextResponse.json({
    sessionId,
    isNew: !existingSessionId,
    timestamp: new Date().toISOString(),
  });
}
