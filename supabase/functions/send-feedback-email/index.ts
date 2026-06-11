import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const TO_EMAIL = "daniel.nussbaum@tierabc.ch";
const FROM_EMAIL = "Brutbegleiter <noreply@brutbegleiter.pages.dev>";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await req.json();
    const { typ, titel, beschreibung, user_email } = body;

    const typenLabel: Record<string, string> = {
      idee: "💡 Idee",
      bug: "🐛 Fehler",
      wunsch: "⭐ Wunsch",
      lob: "👏 Lob",
    };

    const typLabel = typenLabel[typ] || typ;
    const emailBody = `
Neues Feedback im Brutbegleiter:

Typ: ${typLabel}
Titel: ${titel}
Beschreibung: ${beschreibung || "(keine)"}
Von Benutzer: ${user_email || "Anonym"}
Zeitpunkt: ${new Date().toLocaleString("de-CH")}
`;

    // Sende E-Mail via Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        subject: `[Brutbegleiter Feedback] ${typLabel}: ${titel}`,
        text: emailBody,
      }),
    });

    if (!emailResponse.ok) {
      const errText = await emailResponse.text();
      console.error("Resend error:", errText);
      return new Response(JSON.stringify({ error: errText }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
