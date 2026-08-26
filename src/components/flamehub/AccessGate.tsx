import { Flame, Loader2, Upload } from "lucide-react";
import { useState, type ChangeEvent } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { ACCESS_CODE } from "@/lib/flamehub-data";
import { fileToAvatarDataUrl, type Member } from "@/lib/flamehub-session";

type Props = {
  needsProfile: boolean;
  onUnlocked: () => void;
  onRegistered: (member: Member) => void;
};

export function AccessGate({ needsProfile, onUnlocked, onRegistered }: Props) {
  const [code, setCode] = useState("");
  const [codeOk, setCodeOk] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submitCode = (event: React.FormEvent) => {
    event.preventDefault();
    if (code.trim().toLowerCase() !== ACCESS_CODE) {
      toast.error("Wrong code. Ask whoever sent you here.");
      return;
    }
    if (needsProfile) {
      setCodeOk(true);
    } else {
      onUnlocked();
    }
  };

  const pickAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setAvatar(await fileToAvatarDataUrl(file));
    } catch {
      toast.error("Couldn't read that image.");
    }
  };

  const submitProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First and last name are required.");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("members")
      .insert({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        avatar_url: avatar,
      })
      .select()
      .single();
    setSaving(false);

    if (error || !data) {
      toast.error("Couldn't save your profile. Try again.");
      return;
    }
    onRegistered(data as Member);
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div
            className="mx-auto flex size-16 items-center justify-center rounded-2xl"
            style={{ backgroundImage: "var(--gradient-flame)", boxShadow: "var(--shadow-flame)" }}
          >
            <Flame className="size-8 text-primary-foreground" />
          </div>
          <h1 className="mt-5 text-5xl leading-none">
            <span className="flame-text">FlameHub</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Games, apps and soundboards — all in one place.
          </p>
        </div>

        <div className="flame-surface rounded-2xl p-6">
          {!codeOk ? (
            <form onSubmit={submitCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="access-code">Access code</Label>
                <Input
                  id="access-code"
                  autoFocus
                  autoComplete="off"
                  placeholder="Enter the code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Unlock FlameHub
              </Button>
            </form>
          ) : (
            <form onSubmit={submitProfile} className="space-y-4">
              <h2 className="text-2xl">Who are you?</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input
                    id="first-name"
                    autoFocus
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input
                    id="last-name"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Avatar className="size-14">
                  {avatar ? <AvatarImage src={avatar} alt="Your profile picture" /> : null}
                  <AvatarFallback>
                    {(firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label
                    htmlFor="avatar"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-secondary"
                  >
                    <Upload className="size-4" />
                    Profile picture (optional)
                  </Label>
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={pickAvatar}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                Enter FlameHub
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
