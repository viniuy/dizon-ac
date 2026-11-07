import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import nodemailer from "nodemailer";
import { createAdminClient } from "./supabase/admin";

/**
 * Who gets the sign-in codes. Every code goes to all of these, so the owner sees each
 * sign-in even when the staff member is the one signing in.
 */
export const CODE_RECIPIENTS = [
  "vincent.enolpe@gmail.com", // super-admin
  "dizonairconditioningservices@gmail.com", // client
];

const CODE_TTL_MS = 10 * 60_000; // a code works for 10 minutes
const RESEND_AFTER_MS = 60_000; // at most one new code a minute
const MAX_ATTEMPTS = 5; // wrong guesses before the code stops working
const MAX_SENDS = 10; // codes per sign-in, so a session can't flood the inbox

export type CodeResult = { error?: string; ok?: boolean };

/** "vi•••@gmail.com", so the page can say where the code went without printing the address */
export const maskEmail = (email: string) => {
  const [name, domain] = email.split("@");
  return `${name.slice(0, 2)}•••@${domain}`;
};

// The code is never stored, only an HMAC of it keyed by the server's secret
const hash = (sessionId: string, code: string) =>
  createHmac("sha256", process.env.SUPABASE_SECRET_KEY!)
    .update(`${sessionId}:${code}`)
    .digest("hex");

function mailer() {
  const user = process.env.GMAIL_USER;
  // Google shows app passwords in groups of four; the spaces aren't part of it
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  if (!user || !pass)
    throw new Error("GMAIL_USER / GMAIL_APP_PASSWORD are not set");
  return {
    from: user,
    transport: nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    }),
  };
}

/** Make a new code for this sign-in and email it to everyone in CODE_RECIPIENTS */
export async function sendSignInCode({
  sessionId,
  userId,
  email,
  device,
}: {
  sessionId: string;
  userId: string;
  email: string;
  device: string;
}): Promise<CodeResult> {
  const recipients = CODE_RECIPIENTS.filter(Boolean);
  if (!recipients.length)
    return { error: "No one is set up to receive sign-in codes." };

  let admin;
  let mail;
  try {
    admin = createAdminClient();
    mail = mailer();
  } catch (e) {
    console.error("sendSignInCode setup", e);
    return { error: "Sign-in codes aren’t set up on the server yet." };
  }

  const { data: existing } = await admin
    .from("staff_sign_in_codes")
    .select("sent_at, sends, verified_at")
    .eq("session_id", sessionId)
    .maybeSingle();
  if (existing?.verified_at) return { ok: true };
  if (
    existing &&
    Date.now() - new Date(existing.sent_at).getTime() < RESEND_AFTER_MS
  ) {
    return {
      error: "A code was just sent. Wait a minute before asking for another.",
    };
  }
  if (existing && existing.sends >= MAX_SENDS)
    return { error: "Too many codes for this sign-in. Sign in again." };

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const { error } = await admin.from("staff_sign_in_codes").upsert({
    session_id: sessionId,
    user_id: userId,
    code_hash: hash(sessionId, code),
    expires_at: new Date(Date.now() + CODE_TTL_MS).toISOString(),
    attempts: 0,
    sends: (existing?.sends ?? 0) + 1,
    sent_at: new Date().toISOString(),
    verified_at: null,
  });
  if (error) {
    console.error("sendSignInCode store", error);
    return { error: "Couldn’t create a code. Try again." };
  }

  // Tidy up codes from sign-ins more than a month old
  void admin
    .from("staff_sign_in_codes")
    .delete()
    .lt("sent_at", new Date(Date.now() - 30 * 86_400_000).toISOString());

  const when = new Date().toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
    timeStyle: "short",
  });
  try {
    await mail.transport.sendMail({
      from: `Dizon Bookings <${mail.from}>`,
      to: recipients,
      subject: `${code} is your Dizon sign-in code`,
      text: [
        `Sign-in code: ${code}`,
        "",
        `${email} is signing in to the Dizon staff area.`,
        `When: ${when}`,
        `Device: ${device}`,
        "",
        "The code works for 10 minutes.",
        "If nobody you know is signing in right now, don’t share the code and change the staff password.",
      ].join("\n"),
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:420px;margin:0 auto;padding:24px;color:#1c1c1e">
          <p style="margin:0;font-size:13px;color:#6e6e73">Dizon Bookings</p>
          <p style="margin:8px 0 0;font-size:15px">Sign-in code</p>
          <p style="margin:4px 0 16px;font-size:34px;font-weight:700;letter-spacing:6px">${code}</p>
          <p style="margin:0;font-size:15px"><strong>${escapeHtml(email)}</strong> is signing in to the staff area.</p>
          <p style="margin:4px 0 0;font-size:13px;color:#6e6e73">${escapeHtml(when)} · ${escapeHtml(device)}</p>
          <p style="margin:16px 0 0;font-size:13px;color:#6e6e73">The code works for 10 minutes. If nobody you know is signing in right now, don’t share it and change the staff password.</p>
        </div>`,
    });
  } catch (e) {
    console.error("sendSignInCode mail", e);
    return { error: "Couldn’t send the code email. Try again in a moment." };
  }
  return { ok: true };
}

/** Check a typed code; on success this sign-in is verified for as long as the session lasts */
export async function verifySignInCode(
  sessionId: string,
  userId: string,
  code: string,
): Promise<CodeResult> {
  if (!/^\d{6}$/.test(code)) return { error: "Enter the 6-digit code." };

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("staff_sign_in_codes")
    .select("code_hash, expires_at, attempts, verified_at, user_id")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (!row || row.user_id !== userId)
    return { error: "No code was sent for this sign-in. Ask for a new one." };
  if (row.verified_at) return { ok: true };
  if (row.attempts >= MAX_ATTEMPTS)
    return { error: "Too many wrong tries. Ask for a new code." };
  if (new Date(row.expires_at).getTime() < Date.now())
    return { error: "That code has expired. Ask for a new one." };

  const expected = Buffer.from(row.code_hash, "hex");
  const given = Buffer.from(hash(sessionId, code), "hex");
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    await admin
      .from("staff_sign_in_codes")
      .update({ attempts: row.attempts + 1 })
      .eq("session_id", sessionId);
    const left = MAX_ATTEMPTS - row.attempts - 1;
    return {
      error:
        left > 0
          ? `That code isn’t right. ${left} ${left === 1 ? "try" : "tries"} left.`
          : "Too many wrong tries. Ask for a new code.",
    };
  }

  const { error } = await admin
    .from("staff_sign_in_codes")
    .update({ verified_at: new Date().toISOString() })
    .eq("session_id", sessionId);
  if (error) return { error: "Couldn’t confirm the code. Try again." };
  return { ok: true };
}

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
