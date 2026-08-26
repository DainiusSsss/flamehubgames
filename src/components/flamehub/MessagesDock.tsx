import { MessageCircle, Send, Users, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { initials, type Member } from "@/lib/flamehub-session";

type Message = {
  id: string;
  sender_id: string;
  recipient_id: string | null;
  body: string;
  created_at: string;
};

type Props = { me: Member; members: Member[] };

export function MessagesDock({ me, members }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null); // null = public chat
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    void supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(500)
      .then(({ data }) => {
        if (!cancelled && data) setMessages(data as Message[]);
      });

    const channel = supabase
      .channel("flamehub-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => {
            const next = payload.new as Message;
            return prev.some((m) => m.id === next.id) ? prev : [...prev, next];
          });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, []);

  const thread = useMemo(
    () =>
      messages.filter((m) =>
        activeId === null
          ? m.recipient_id === null
          : (m.sender_id === me.id && m.recipient_id === activeId) ||
            (m.sender_id === activeId && m.recipient_id === me.id),
      ),
    [messages, activeId, me.id],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [thread.length, open]);

  const unread = messages.filter((m) => m.recipient_id === me.id).length;

  const nameOf = (id: string) => {
    if (id === me.id) return "You";
    const member = members.find((m) => m.id === id);
    return member ? `${member.first_name} ${member.last_name}` : "Someone";
  };

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    const { error } = await supabase
      .from("messages")
      .insert({ sender_id: me.id, recipient_id: activeId, body });
    if (error) toast.error("Message didn't send.");
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {open ? (
        <div className="flame-surface flex h-[26rem] w-[min(92vw,26rem)] flex-col overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="font-display text-xl">Messages</p>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close messages">
              <X className="size-4" />
            </Button>
          </div>

          <div className="flex min-h-0 flex-1">
            <ScrollArea className="w-36 shrink-0 border-r border-border">
              <div className="p-2">
                <button
                  type="button"
                  onClick={() => setActiveId(null)}
                  className={`mb-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs ${
                    activeId === null ? "bg-secondary text-accent" : "hover:bg-secondary/60"
                  }`}
                >
                  <Users className="size-4" /> Everyone
                </button>
                {members
                  .filter((member) => member.id !== me.id)
                  .map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => setActiveId(member.id)}
                      className={`mb-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs ${
                        activeId === member.id ? "bg-secondary text-accent" : "hover:bg-secondary/60"
                      }`}
                    >
                      <Avatar className="size-6">
                        {member.avatar_url ? (
                          <AvatarImage src={member.avatar_url} alt="" />
                        ) : null}
                        <AvatarFallback className="text-[10px]">{initials(member)}</AvatarFallback>
                      </Avatar>
                      <span className="truncate">{member.first_name}</span>
                    </button>
                  ))}
              </div>
            </ScrollArea>

            <div className="flex min-w-0 flex-1 flex-col">
              <ScrollArea className="flex-1">
                <div className="space-y-3 p-3">
                  {thread.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      {activeId === null
                        ? "No public messages yet. Say hi to everyone."
                        : "No messages yet in this chat."}
                    </p>
                  ) : (
                    thread.map((message) => (
                      <div
                        key={message.id}
                        className={message.sender_id === me.id ? "text-right" : "text-left"}
                      >
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          {nameOf(message.sender_id)}
                        </p>
                        <p
                          className={`inline-block max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                            message.sender_id === me.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          {message.body}
                        </p>
                      </div>
                    ))
                  )}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>

              <form onSubmit={send} className="flex gap-2 border-t border-border p-2">
                <Input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={
                    activeId === null
                      ? "Message everyone…"
                      : `Message ${nameOf(activeId).split(" ")[0]}…`
                  }
                />
                <Button type="submit" size="icon" aria-label="Send message">
                  <Send className="size-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setOpen(true)}
          className="rounded-full pl-4 pr-5"
          style={{ boxShadow: "var(--shadow-flame)" }}
        >
          <MessageCircle className="size-4" />
          Messages
          {unread > 0 ? (
            <span className="ml-1 rounded-full bg-ember px-2 text-xs text-ember-foreground">
              {unread}
            </span>
          ) : null}
        </Button>
      )}
    </div>
  );
}
