import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { ACCESS_CODE, OWNER_CODE } from "./flamehub-codes.server";

export type PublicMember = {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  created_at: string;
  last_seen_at: string;
};

const MEMBER_FIELDS = "id, first_name, last_name, avatar_url, created_at, last_seen_at";

export function assertAccessCode(code: string) {
  if (code.trim().toLowerCase() !== ACCESS_CODE) {
    throw new Error("Invalid access code");
  }
}

export function assertOwnerCode(code: string) {
  if (code.trim() !== OWNER_CODE) {
    throw new Error("Invalid owner code");
  }
}

/** Resolves the caller from their member id + private session token. */
export async function requireMember(memberId: string, token: string): Promise<PublicMember> {
  const { data, error } = await supabaseAdmin
    .from("members")
    .select(MEMBER_FIELDS)
    .eq("id", memberId)
    .eq("session_token", token)
    .maybeSingle();

  if (error || !data) throw new Error("Unauthorized");
  return data as PublicMember;
}

export async function createMember(input: {
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}): Promise<{ member: PublicMember; token: string }> {
  const { data, error } = await supabaseAdmin
    .from("members")
    .insert(input)
    .select(`${MEMBER_FIELDS}, session_token`)
    .single();

  if (error || !data) throw new Error("Could not create profile");
  const { session_token, ...member } = data as PublicMember & { session_token: string };
  return { member, token: session_token };
}

export async function listMembersFor(memberId: string, token: string): Promise<PublicMember[]> {
  await requireMember(memberId, token);
  const { data } = await supabaseAdmin
    .from("members")
    .select(MEMBER_FIELDS)
    .order("created_at", { ascending: true });
  return (data ?? []) as PublicMember[];
}

export async function touchMember(memberId: string, token: string) {
  await requireMember(memberId, token);
  await supabaseAdmin
    .from("members")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", memberId);
}

export async function listMessagesFor(memberId: string, token: string) {
  await requireMember(memberId, token);
  const { data } = await supabaseAdmin
    .from("messages")
    .select("id, sender_id, recipient_id, body, created_at")
    .or(`recipient_id.is.null,sender_id.eq.${memberId},recipient_id.eq.${memberId}`)
    .order("created_at", { ascending: true })
    .limit(500);
  return data ?? [];
}

export async function sendMessageAs(
  memberId: string,
  token: string,
  recipientId: string | null,
  body: string,
) {
  await requireMember(memberId, token);
  if (recipientId) {
    const { data } = await supabaseAdmin
      .from("members")
      .select("id")
      .eq("id", recipientId)
      .maybeSingle();
    if (!data) throw new Error("Unknown recipient");
  }
  const { error } = await supabaseAdmin
    .from("messages")
    .insert({ sender_id: memberId, recipient_id: recipientId, body });
  if (error) throw new Error("Could not send message");
}

export async function deleteMemberAsOwner(ownerCode: string, memberId: string) {
  assertOwnerCode(ownerCode);
  await supabaseAdmin.from("messages").delete().eq("sender_id", memberId);
  await supabaseAdmin.from("messages").delete().eq("recipient_id", memberId);
  const { error } = await supabaseAdmin.from("members").delete().eq("id", memberId);
  if (error) throw new Error("Could not delete member");
}

export async function renameMemberAsOwner(
  ownerCode: string,
  memberId: string,
  firstName: string,
  lastName: string,
) {
  assertOwnerCode(ownerCode);
  const { error } = await supabaseAdmin
    .from("members")
    .update({ first_name: firstName, last_name: lastName })
    .eq("id", memberId);
  if (error) throw new Error("Could not update name");
}
