import { createFileRoute } from "@tanstack/react-router";
import { Flame } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { AccessGate } from "@/components/flamehub/AccessGate";
import { HubGrid } from "@/components/flamehub/HubGrid";
import { MessagesDock } from "@/components/flamehub/MessagesDock";
import { OwnerPanel } from "@/components/flamehub/OwnerPanel";
import { SoundBooster } from "@/components/flamehub/SoundBooster";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMyMember, listMembers, touchLastSeen } from "@/lib/flamehub.functions";
import { APPS, GAMES, SOUNDBOARDS } from "@/lib/flamehub-data";
import {
  clearSession,
  initials,
  readStoredMemberId,
  readStoredToken,
  readUnlocked,
  storeSession,
  storeUnlocked,
  type Member,
} from "@/lib/flamehub-session";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FlameHub — Unblocked Games, Apps & Soundboards" },
      {
        name: "description",
        content:
          "FlameHub is a code-protected hub for unblocked games, everyday apps, soundboards, live messaging and a drag-to-boost sound booster.",
      },
      { property: "og:title", content: "FlameHub — Unblocked Games, Apps & Soundboards" },
      {
        property: "og:description",
        content:
          "Enter the code to unlock games, apps, soundboards and live chat inside FlameHub.",
      },
    ],
  }),
  component: FlameHubPage,
});

function FlameHubPage() {
  const [hydrated, setHydrated] = useState(false);
  const [me, setMe] = useState<Member | null>(null);
  const [storedId, setStoredId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);

  const loadMembers = useCallback(async () => {
    if (!storedId || !token) return;
    try {
      const data = await listMembers({ data: { memberId: storedId, token } });
      setMembers(data as Member[]);
    } catch {
      /* session no longer valid; the gate handles re-entry */
    }
  }, [storedId, token]);

  useEffect(() => {
    setStoredId(readStoredMemberId());
    setToken(readStoredToken());
    setUnlocked(readUnlocked());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    void loadMembers();
    const interval = window.setInterval(() => void loadMembers(), 10000);
    return () => window.clearInterval(interval);
  }, [unlocked, loadMembers]);

  // Keep our own profile row in sync once we know who we are.
  useEffect(() => {
    if (!unlocked || !storedId || !token) return;
    void touchLastSeen({ data: { memberId: storedId, token } }).catch(() => undefined);
  }, [unlocked, storedId, token]);

  useEffect(() => {
    if (!unlocked || !storedId) return;
    const found = members.find((member) => member.id === storedId);
    if (found) setMe(found);
  }, [members, storedId, unlocked]);

  const handleReturningUnlock = async () => {
    const id = readStoredMemberId();
    const storedToken = readStoredToken();
    if (!id || !storedToken) {
      clearSession();
      setStoredId(null);
      setToken(null);
      return;
    }
    try {
      const member = (await getMyMember({ data: { memberId: id, token: storedToken } })) as Member;
      setMe(member);
      setUnlocked(true);
      storeUnlocked();
      toast.success(`Welcome back, ${member.first_name}!`);
    } catch {
      clearSession();
      setStoredId(null);
      setToken(null);
      toast.error("Your session expired — set up your profile again.");
    }
  };

  if (!hydrated) return null;

  if (!unlocked) {
    return (
      <AccessGate
        needsProfile={storedId === null || token === null}
        onUnlocked={() => void handleReturningUnlock()}
        onRegistered={(member, newToken) => {
          storeSession(member.id, newToken);
          storeUnlocked();
          setStoredId(member.id);
          setToken(newToken);
          setMe(member);
          setUnlocked(true);
          toast.success(`Welcome to FlameHub, ${member.first_name}!`);
        }}
      />
    );
  }


  const chatMe: Member | null =
    me ??
    members.find((member) => member.id === storedId) ??
    (storedId
      ? {
          id: storedId,
          first_name: "You",
          last_name: "",
          avatar_url: null,
          created_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
        }
      : null);

  return (
    <div className="min-h-screen pb-24">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-4">
          <div className="flex items-center gap-2">
            <div
              className="flex size-9 items-center justify-center rounded-xl"
              style={{ backgroundImage: "var(--gradient-flame)" }}
            >
              <Flame className="size-5 text-primary-foreground" />
            </div>
            <span className="font-display text-3xl leading-none">
              <span className="flame-text">FlameHub</span>
            </span>
          </div>

          <div className="order-3 w-full sm:order-2 sm:w-auto">
            <SoundBooster />
          </div>

          <div className="order-2 ml-auto flex items-center gap-3 sm:order-3">
            {me ? (
              <div className="flex items-center gap-2">
                <Avatar className="size-8">
                  {me.avatar_url ? <AvatarImage src={me.avatar_url} alt="" /> : null}
                  <AvatarFallback className="text-xs">{initials(me)}</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  {me.first_name} {me.last_name}
                </span>
              </div>
            ) : null}
            <OwnerPanel members={members} onMembersChanged={() => void loadMembers()} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-4xl sm:text-5xl">
          {me ? `Hey ${me.first_name}, what are we playing?` : "What are we playing?"}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Everything loads through FlameHub&apos;s own preview server, so you never leave the hub.
        </p>

        <Tabs defaultValue="games" className="mt-8">
          <TabsList>
            <TabsTrigger value="games">Games</TabsTrigger>
            <TabsTrigger value="apps">Apps</TabsTrigger>
            <TabsTrigger value="soundboard">Soundboard</TabsTrigger>
          </TabsList>

          <TabsContent value="games" className="mt-6">
            <HubGrid items={GAMES} label="Game" />
          </TabsContent>
          <TabsContent value="apps" className="mt-6">
            <HubGrid items={APPS} label="App" />
          </TabsContent>
          <TabsContent value="soundboard" className="mt-6 space-y-6">
            <HubGrid items={SOUNDBOARDS} label="Soundboard" />

            <div className="flame-surface overflow-hidden rounded-2xl">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="text-2xl">MyInstants live board</h2>
                <span className="text-xs text-muted-foreground">
                  Boost the volume with the slider up top
                </span>
              </div>
              <iframe
                title="MyInstants soundboard"
                src="https://www.myinstants.com"
                className="h-[70vh] w-full bg-background"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {chatMe && token ? <MessagesDock me={chatMe} members={members} token={token} /> : null}
    </div>
  );
}
