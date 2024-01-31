"use client";

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import chatAction from "./action";
import { corresponding } from "@/constants/corresponding";

type ILipSync = {
  mouthCues: {
    start: number;
    end: number;
    value: keyof typeof corresponding;
  }[];
  metadata: {
    soundFile: string;
    duration: number;
  };
};

export type IMessage = {
  text: string;
  audio: string;
  lipsync: ILipSync;
  facialExpression: any;
  animation: string;
};

export const ChatContext = createContext<{
  chat: (message: any) => Promise<void>;
  message: IMessage | null;
  onMessagePlayed: () => void;
  loading: boolean;
  cameraZoomed: boolean;
  setCameraZoomed: Dispatch<SetStateAction<boolean>>;
} | null>(null);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const chat = async (message: IMessage) => {
    setLoading(true);
    const data = await chatAction(message);
    setMessages((messages) => [...messages, ...data]);
    setLoading(false);
  };
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [message, setMessage] = useState<IMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const onMessagePlayed = () => {
    setMessages((messages) => messages.slice(1));
  };

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
