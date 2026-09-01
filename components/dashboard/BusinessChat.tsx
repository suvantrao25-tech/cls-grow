"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Message = {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
};

type Props = {
  connectionId: string;
  otherBusinessName: string;
  currentUserId: string;
};

export default function BusinessChat({
  connectionId,
  otherBusinessName,
  currentUserId,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel(`business-chat-${connectionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "business_messages",
          filter: `connection_id=eq.${connectionId}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [connectionId]);

  async function loadMessages() {
    const { data, error } = await supabase
      .from("business_messages")
      .select("id, sender_id, message, created_at")
      .eq("connection_id", connectionId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Chat load error:", error.message);
      return;
    }

    setMessages(data || []);
  }

  async function sendMessage() {
    const message = text.trim();

    if (!message || sending) return;

    setSending(true);

    const { error } = await supabase.from("business_messages").insert({
      connection_id: connectionId,
      sender_id: currentUserId,
      message,
    });

    if (error) {
      alert(error.message);
    } else {
      setText("");
    }

    setSending(false);
  }

  return (
    <div className="mt-4 border rounded-xl overflow-hidden">
      <div className="bg-teal-600 text-white px-4 py-3 font-semibold">
        Chat with {otherBusinessName}
      </div>

      <div className="h-64 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500">
            No messages yet. Start the conversation.
          </p>
        ) : (
          messages.map((item) => (
            <div
              key={item.id}
              className={`flex ${
                item.sender_id === currentUserId
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                  item.sender_id === currentUserId
                    ? "bg-teal-600 text-white"
                    : "bg-white border text-gray-800"
                }`}
              >
                {item.message}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2 p-3 bg-white border-t">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Type a message..."
          className="flex-1 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
        />

        <button
          type="button"
          onClick={sendMessage}
          disabled={sending || !text.trim()}
          className="px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold disabled:opacity-50"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
