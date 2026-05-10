import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingPayload {
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  room_name: string;
  check_in: string;
  check_out: string;
  total_nights: number;
  total_amount: number;
  number_of_guests: number;
  special_requests?: string;
}

const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "rayaankhaaan@gmail.com";
const ADMIN_PHONE = Deno.env.get("ADMIN_PHONE") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID") ?? "";
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN") ?? "";
const TWILIO_FROM_NUMBER = Deno.env.get("TWILIO_FROM_NUMBER") ?? "";

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "long", year: "numeric",
  });
}

function formatCurrency(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

// ── Email via Resend ──────────────────────────────────────────────────────────

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set – skipping email to", to);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Casa Raihan <bookings@casaraihan.com>",
      to,
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
  }
}

// ── SMS via Twilio ────────────────────────────────────────────────────────────

async function sendSMS(to: string, body: string) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    console.warn("Twilio env vars not set – skipping SMS to", to);
    return;
  }
  // Ensure Indian numbers have +91 prefix
  const normalized = to.startsWith("+") ? to : `+91${to.replace(/^0/, "")}`;
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: normalized, From: TWILIO_FROM_NUMBER, Body: body }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    console.error("Twilio error:", err);
  }
}

// ── Email templates ───────────────────────────────────────────────────────────

function guestEmailHtml(b: BookingPayload) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9f5f0;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f5f0;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#92400e,#b45309);padding:40px 32px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:28px;font-weight:300;letter-spacing:4px;">CASA RAIHAN</h1>
          <p style="margin:8px 0 0;color:#fde68a;font-size:13px;letter-spacing:2px;">COORG, KARNATAKA</p>
        </td></tr>
        <!-- Confirmation Badge -->
        <tr><td style="padding:32px 32px 0;text-align:center;">
          <div style="display:inline-block;background:#ecfdf5;border:2px solid #6ee7b7;border-radius:50px;padding:10px 24px;">
            <span style="color:#059669;font-size:14px;font-weight:600;">✓ Booking Confirmed</span>
          </div>
          <h2 style="margin:20px 0 8px;font-size:22px;color:#1f2937;font-weight:400;">Thank you, ${b.guest_name}!</h2>
          <p style="margin:0;color:#6b7280;font-size:15px;">Your reservation at Casa Raihan is confirmed.</p>
        </td></tr>
        <!-- Booking Details -->
        <tr><td style="padding:24px 32px;">
          <table width="100%" style="background:#fffbf5;border:1px solid #fde68a;border-radius:12px;padding:24px;" cellpadding="0" cellspacing="0">
            <tr><td style="padding-bottom:16px;border-bottom:1px solid #fde68a;">
              <p style="margin:0;font-size:11px;color:#92400e;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Room</p>
              <p style="margin:4px 0 0;font-size:18px;color:#1f2937;">${b.room_name}</p>
            </td></tr>
            <tr><td style="padding:16px 0;border-bottom:1px solid #fde68a;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%">
                    <p style="margin:0;font-size:11px;color:#92400e;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Check-In</p>
                    <p style="margin:4px 0 0;font-size:15px;color:#1f2937;">${formatDate(b.check_in)}</p>
                  </td>
                  <td width="50%">
                    <p style="margin:0;font-size:11px;color:#92400e;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Check-Out</p>
                    <p style="margin:4px 0 0;font-size:15px;color:#1f2937;">${formatDate(b.check_out)}</p>
                  </td>
                </tr>
              </table>
            </td></tr>
            <tr><td style="padding:16px 0;border-bottom:1px solid #fde68a;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%">
                    <p style="margin:0;font-size:11px;color:#92400e;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Duration</p>
                    <p style="margin:4px 0 0;font-size:15px;color:#1f2937;">${b.total_nights} Night${b.total_nights > 1 ? "s" : ""}</p>
                  </td>
                  <td width="50%">
                    <p style="margin:0;font-size:11px;color:#92400e;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Guests</p>
                    <p style="margin:4px 0 0;font-size:15px;color:#1f2937;">${b.number_of_guests} Guest${b.number_of_guests > 1 ? "s" : ""}</p>
                  </td>
                </tr>
              </table>
            </td></tr>
            <tr><td style="padding-top:16px;text-align:right;">
              <p style="margin:0;font-size:11px;color:#92400e;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Total Amount</p>
              <p style="margin:4px 0 0;font-size:28px;color:#92400e;font-weight:600;">${formatCurrency(b.total_amount)}</p>
            </td></tr>
          </table>
        </td></tr>
        ${b.special_requests ? `
        <tr><td style="padding:0 32px 24px;">
          <div style="background:#f3f4f6;border-radius:8px;padding:16px;">
            <p style="margin:0 0 6px;font-size:11px;color:#6b7280;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Special Requests</p>
            <p style="margin:0;color:#374151;font-size:14px;">${b.special_requests}</p>
          </div>
        </td></tr>` : ""}
        <!-- Footer -->
        <tr><td style="padding:24px 32px;border-top:1px solid #f3f4f6;text-align:center;">
          <p style="margin:0 0 8px;color:#374151;font-size:14px;">We look forward to hosting you!</p>
          <p style="margin:0;color:#6b7280;font-size:12px;">Questions? Reply to this email or call us.</p>
          <p style="margin:16px 0 0;color:#d1d5db;font-size:11px;">Casa Raihan · Coorg, Karnataka, India</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function adminEmailHtml(b: BookingPayload) {
  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr><td style="background:#92400e;padding:20px 28px;">
          <h1 style="margin:0;color:#fff;font-size:18px;">🏡 New Booking — Casa Raihan</h1>
        </td></tr>
        <tr><td style="padding:28px;">
          <table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;color:#374151;">
            <tr><td style="color:#6b7280;width:140px;">Room</td><td style="font-weight:600;">${b.room_name}</td></tr>
            <tr><td style="color:#6b7280;">Guest</td><td style="font-weight:600;">${b.guest_name}</td></tr>
            <tr><td style="color:#6b7280;">Email</td><td><a href="mailto:${b.guest_email}" style="color:#2563eb;">${b.guest_email}</a></td></tr>
            <tr><td style="color:#6b7280;">Phone</td><td><a href="tel:${b.guest_phone}" style="color:#2563eb;">${b.guest_phone}</a></td></tr>
            <tr><td style="color:#6b7280;">Check-In</td><td>${formatDate(b.check_in)}</td></tr>
            <tr><td style="color:#6b7280;">Check-Out</td><td>${formatDate(b.check_out)}</td></tr>
            <tr><td style="color:#6b7280;">Nights</td><td>${b.total_nights}</td></tr>
            <tr><td style="color:#6b7280;">Guests</td><td>${b.number_of_guests}</td></tr>
            ${b.special_requests ? `<tr><td style="color:#6b7280;">Requests</td><td>${b.special_requests}</td></tr>` : ""}
            <tr><td style="color:#6b7280;font-weight:600;font-size:15px;">Total</td><td style="font-weight:700;font-size:18px;color:#92400e;">${formatCurrency(b.total_amount)}</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:16px 28px;background:#fffbf5;border-top:1px solid #fde68a;">
          <p style="margin:0;font-size:12px;color:#92400e;">Please confirm this booking with the guest as soon as possible.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── SMS templates ─────────────────────────────────────────────────────────────

function guestSMS(b: BookingPayload) {
  return `Casa Raihan ✓ Hi ${b.guest_name.split(" ")[0]}, your booking is confirmed!\n\nRoom: ${b.room_name}\nCheck-in: ${formatDate(b.check_in)}\nCheck-out: ${formatDate(b.check_out)}\nTotal: ${formatCurrency(b.total_amount)}\n\nWe look forward to hosting you in Coorg!`;
}

function adminSMS(b: BookingPayload) {
  return `New Booking! ${b.room_name}\nGuest: ${b.guest_name}\nPhone: ${b.guest_phone}\n${formatDate(b.check_in)} → ${formatDate(b.check_out)} (${b.total_nights}N)\nTotal: ${formatCurrency(b.total_amount)}`;
}

// ── Handler ───────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const booking: BookingPayload = await req.json();

    const tasks: Promise<void>[] = [];

    // Emails
    tasks.push(sendEmail(booking.guest_email, "✅ Your Casa Raihan booking is confirmed!", guestEmailHtml(booking)));
    tasks.push(sendEmail(ADMIN_EMAIL, `🏡 New Booking: ${booking.room_name} — ${booking.guest_name}`, adminEmailHtml(booking)));

    // SMS
    if (booking.guest_phone) {
      tasks.push(sendSMS(booking.guest_phone, guestSMS(booking)));
    }
    if (ADMIN_PHONE) {
      tasks.push(sendSMS(ADMIN_PHONE, adminSMS(booking)));
    }

    await Promise.allSettled(tasks);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("notify-booking error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
