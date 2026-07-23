"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { awardXP } from "@/lib/award-xp";
import { classifyXPTier } from "@/lib/xp";
import { getXPRuleAmount, XP_RULE_CATEGORIES } from "@/lib/xp-rules";
import { ROLE_TO_XP_TRACK } from "@/lib/roles";
import {
  COACH_SESSION_TYPES,
  CREATOR_CONTENT_TYPES,
  GAME_TYPES,
  OFFICIAL_ROLES,
} from "@/lib/activity-types";

const witnessField = z
  .string()
  .min(1, "A confirmation name is required before XP can be granted.");

const schemas = {
  PLAYER: z.object({
    type: z.enum(GAME_TYPES),
    pts: z.coerce.number().int().min(0).default(0),
    ast: z.coerce.number().int().min(0).default(0),
    reb: z.coerce.number().int().min(0).default(0),
    min: z.coerce.number().int().min(0).default(0),
    result: z.string().optional(),
    witness: witnessField,
  }),
  COACH: z.object({
    type: z.enum(COACH_SESSION_TYPES),
    attendees: z.coerce.number().int().min(0).default(0),
    min: z.coerce.number().int().min(0).default(0),
    notes: z.string().optional(),
    witness: witnessField,
  }),
  CREATOR: z.object({
    type: z.enum(CREATOR_CONTENT_TYPES),
    platform: z.string().optional(),
    views: z.coerce.number().int().min(0).default(0),
    notes: z.string().optional(),
  }),
  ADMIN: z.object({
    type: z.enum(GAME_TYPES),
    offrole: z.enum(OFFICIAL_ROLES),
    disputes: z.coerce.number().int().min(0).default(0),
    witness: witnessField,
  }),
};

function toPlainObject(formData: FormData): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && value !== "") obj[key] = value;
  }
  return obj;
}

export async function logActivity(formData: FormData) {
  const sessionUser = await requireUser();
  const user = await db.user.findUniqueOrThrow({ where: { id: sessionUser.id } });
  // Role is always derived from the session-backed user record, never trusted
  // from the client -- a hidden form field could otherwise claim any role.
  const role = user.activeRole;
  if (!role) redirect("/onboarding/role");

  const schema = schemas[role];
  const parsed = schema.safeParse(toPlainObject(formData));
  if (!parsed.success) {
    redirect(`/log?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }
  const data = parsed.data;
  const track = ROLE_TO_XP_TRACK[role];

  let category: string;
  switch (role) {
    case "PLAYER":
      category = XP_RULE_CATEGORIES.GAME;
      break;
    case "COACH":
      category = XP_RULE_CATEGORIES.COACH_SESSION;
      break;
    case "CREATOR":
      category = XP_RULE_CATEGORIES.CREATOR_CONTENT;
      break;
    case "ADMIN":
      category = XP_RULE_CATEGORIES.OFFICIATING;
      break;
  }

  const xpAmount = await getXPRuleAmount(category as never, data.type);
  const tier = classifyXPTier(xpAmount);

  let match: { id: string } | null = null;
  if (role === "PLAYER") {
    const d = data as z.infer<typeof schemas.PLAYER>;
    match = await db.match.create({
      data: {
        type: d.type,
        result: d.result || null,
        note: `${d.pts} pts, ${d.ast} ast, ${d.reb} reb (${d.min} min)`,
        pts: d.pts,
        ast: d.ast,
        reb: d.reb,
        minutes: d.min,
        confirmations: { witnessName: d.witness },
      },
    });
    if (d.ast > 0) {
      await db.attribute.updateMany({
        where: { userId: user.id, key: "passing", value: { lt: 99 } },
        data: { value: { increment: 1 } },
      });
    }
  }

  const activityLog = await db.activityLog.create({
    data: {
      userId: user.id,
      role,
      type: data.type,
      tier,
      xpAwarded: xpAmount,
      track,
      witnessName: "witness" in data ? data.witness : null,
      matchId: match?.id,
    },
  });

  if (role === "CREATOR") {
    const d = data as z.infer<typeof schemas.CREATOR>;
    await db.feedPost.create({
      data: {
        userId: user.id,
        roleLabel: "Creator",
        text: `New ${d.type}: ${d.notes || "check it out"}`,
      },
    });
  }

  await awardXP(user.id, track, xpAmount);

  redirect(`/log?logged=${activityLog.id}`);
}

export async function submitMilestone(milestoneId: string) {
  const user = await requireUser();
  await db.milestoneSubmission.create({
    data: { userId: user.id, milestoneId, status: "PENDING" },
  });
  redirect("/log?milestoneSubmitted=1");
}
