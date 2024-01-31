"use server";

import { IMessage } from "./useChat";

export default async function chatAction(
  message: IMessage
): Promise<IMessage[]> {
  const data = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
    cache: "no-store",
  });
  const resp = await data.json();
  return resp.messages;
}
