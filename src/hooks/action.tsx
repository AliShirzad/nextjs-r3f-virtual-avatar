"use server";

import { getIntroMessages } from "@/lib/messages";
import { IMessage } from "./useChat";

/**
 * Returns the avatar's reply for a given user message.
 *
 * This used to `fetch("http://localhost:3000/api/chat")` — a server action
 * calling back into its own HTTP route, which broke anywhere that wasn't a
 * dev box on port 3000. The message source is now shared directly; the route
 * still exists for external callers.
 */
export default async function chatAction(
  _message: IMessage
): Promise<IMessage[]> {
  return (await getIntroMessages()) as IMessage[];
}
