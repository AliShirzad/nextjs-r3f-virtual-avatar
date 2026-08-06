import { NextResponse } from "next/server";

import { getIntroMessages } from "@/lib/messages";

export async function POST() {
  return NextResponse.json({ messages: await getIntroMessages() });
}
