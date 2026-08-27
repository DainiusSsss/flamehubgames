import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const sessionSchema = z.object({
  memberId: z.string().uuid(),
  token: z.string().uuid(),
});

const registerSchema = z.object({
  code: z.string().min(1).max(64),
  firstName: z.string().trim().min(1).max(40),
  lastName: z.string().trim().min(1).max(40),
  avatarUrl: z
    .string()
    .max(400_000)
    .regex(/^data:image\/(png|jpeg|webp);base64,/)
    .nullable(),
});

export const registerMember = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => registerSchema.parse(data))
  .handler(async ({ data }) => {
    const { assertAccessCode, createMember } = await import("./flamehub.server");
    assertAccessCode(data.code);
    return createMember({
      first_name: data.firstName,
      last_name: data.lastName,
      avatar_url: data.avatarUrl,
    });
  });

export const getMyMember = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => sessionSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireMember } = await import("./flamehub.server");
    return requireMember(data.memberId, data.token);
  });

export const listMembers = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => sessionSchema.parse(data))
  .handler(async ({ data }) => {
    const { listMembersFor } = await import("./flamehub.server");
    return listMembersFor(data.memberId, data.token);
  });

export const touchLastSeen = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => sessionSchema.parse(data))
  .handler(async ({ data }) => {
    const { touchMember } = await import("./flamehub.server");
    await touchMember(data.memberId, data.token);
    return { ok: true };
  });

export const listMessages = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => sessionSchema.parse(data))
  .handler(async ({ data }) => {
    const { listMessagesFor } = await import("./flamehub.server");
    return listMessagesFor(data.memberId, data.token);
  });

export const sendMessage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    sessionSchema
      .extend({
        recipientId: z.string().uuid().nullable(),
        body: z.string().trim().min(1).max(2000),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { sendMessageAs } = await import("./flamehub.server");
    await sendMessageAs(data.memberId, data.token, data.recipientId, data.body);
    return { ok: true };
  });

export const unlockOwnerPanel = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ ownerCode: z.string().min(1).max(64) }).parse(data))
  .handler(async ({ data }) => {
    const { assertOwnerCode } = await import("./flamehub.server");
    assertOwnerCode(data.ownerCode);
    return { ok: true };
  });

export const renameMember = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        ownerCode: z.string().min(1).max(64),
        memberId: z.string().uuid(),
        firstName: z.string().trim().min(1).max(40),
        lastName: z.string().trim().min(1).max(40),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { renameMemberAsOwner } = await import("./flamehub.server");
    await renameMemberAsOwner(data.ownerCode, data.memberId, data.firstName, data.lastName);
    return { ok: true };
  });
