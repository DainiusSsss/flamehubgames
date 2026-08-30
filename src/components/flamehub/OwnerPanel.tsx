import { Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { deleteMember, renameMember, unlockOwnerPanel } from "@/lib/flamehub.functions";
import type { Member } from "@/lib/flamehub-session";

type Props = { members: Member[]; onMembersChanged: () => void };

export function OwnerPanel({ members, onMembersChanged }: Props) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { first: string; last: string }>>({});

  const draftFor = (member: Member) =>
    drafts[member.id] ?? { first: member.first_name, last: member.last_name };

  const setDraft = (id: string, patch: Partial<{ first: string; last: string }>) =>
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        first: patch.first ?? prev[id]?.first ?? members.find((m) => m.id === id)!.first_name,
        last: patch.last ?? prev[id]?.last ?? members.find((m) => m.id === id)!.last_name,
      },
    }));

  const save = async (member: Member) => {
    const draft = draftFor(member);
    if (!draft.first.trim() || !draft.last.trim()) {
      toast.error("Names can't be empty.");
      return;
    }
    setSavingId(member.id);
    try {
      await renameMember({
        data: {
          ownerCode: code,
          memberId: member.id,
          firstName: draft.first.trim(),
          lastName: draft.last.trim(),
        },
      });
      toast.success("Name updated.");
      onMembersChanged();
    } catch {
      toast.error("Couldn't save that name.");
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (member: Member) => {
    if (!window.confirm(`Delete ${member.first_name} ${member.last_name}? This can't be undone.`))
      return;
    setDeletingId(member.id);
    try {
      await deleteMember({ data: { ownerCode: code, memberId: member.id } });
      toast.success("Account deleted.");
      onMembersChanged();
    } catch {
      toast.error("Couldn't delete that account.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setUnlocked(false);
          setCode("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ShieldCheck className="size-4" />
          Owner panel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Owner panel</DialogTitle>
          <DialogDescription>
            {unlocked
              ? "Edit the display name of anyone who has entered FlameHub."
              : "Enter the owner code to continue."}
          </DialogDescription>
        </DialogHeader>

        {!unlocked ? (
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setChecking(true);
              try {
                await unlockOwnerPanel({ data: { ownerCode: code.trim() } });
                setUnlocked(true);
              } catch {
                toast.error("Incorrect owner code.");
              } finally {
                setChecking(false);
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="owner-code">Owner code</Label>
              <Input
                id="owner-code"
                type="password"
                autoComplete="off"
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={checking}>
              {checking ? <Loader2 className="size-4 animate-spin" /> : null}
              Unlock panel
            </Button>
          </form>
        ) : (
          <ScrollArea className="max-h-96 pr-2">
            <div className="space-y-3">
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nobody has signed in yet.</p>
              ) : (
                members.map((member) => {
                  const draft = draftFor(member);
                  return (
                    <div
                      key={member.id}
                      className="flex flex-wrap items-end gap-2 rounded-lg border border-border p-3"
                    >
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs">First</Label>
                        <Input
                          value={draft.first}
                          onChange={(event) => setDraft(member.id, { first: event.target.value })}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs">Last</Label>
                        <Input
                          value={draft.last}
                          onChange={(event) => setDraft(member.id, { last: event.target.value })}
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={() => void save(member)}
                        disabled={savingId === member.id}
                      >
                        {savingId === member.id ? <Loader2 className="size-4 animate-spin" /> : null}
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        aria-label={`Delete ${member.first_name}`}
                        onClick={() => void remove(member)}
                        disabled={deletingId === member.id}
                      >
                        {deletingId === member.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
