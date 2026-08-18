import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "session_id";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Retrieves the existing anonymous session ID from cookies,
 * or generates and sets a new UUID v4 if one does not exist.
 */
export async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existingCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (existingCookie?.value) {
    return existingCookie.value;
  }

  const newSessionId = crypto.randomUUID();

  cookieStore.set(SESSION_COOKIE_NAME, newSessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });

  return newSessionId;
}

/**
 * Retrieves the session ID if it exists, without creating a new one.
 */
export async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE_NAME);
  return cookie?.value ?? null;
}
