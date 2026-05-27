import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const ContextSchema = z.object({
  plantName: z.string(),
  location: z.string(),
  species: z.string(),
  healthScore: z.number(),
  moisture: z.number(),
  temperature: z.number(),
  light: z.number(),
  lightsOn: z.boolean(),
  lightBrightness: z.number(),
  lastWatered: z.string(),
  lightHours: z.number(),
  activeAutomations: z.array(z.string()).max(20),
  activeAlerts: z.array(z.string()).max(20),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(40),
  context: ContextSchema,
});

export type ChatMessage = z.infer<typeof MessageSchema>;
export type DashboardContext = z.infer<typeof ContextSchema>;

export const askGardenAi = createServerFn({ method: "POST" })
  .inputValidator((data) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<{ ok: true; reply: string } | { ok: false; error: string }> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { ok: false, error: "AI service not configured" };

    const ctx = data.context;
    const systemPrompt = `You are GardenGPT, a friendly smart-garden assistant inside the user's Smart Garden mobile app.
You can SEE the user's live dashboard data below. Use it to answer questions, summarize today's status, flag issues, and suggest concrete next actions (watering, lighting, automations).
Be concise, warm, and practical. Use short paragraphs or bullet lists. Use simple language. If the user asks "what's the update for today", give a brief status digest grounded in the data. If something looks off (low moisture, extreme temp, low health score, active alerts), call it out and suggest a fix.

LIVE DASHBOARD SNAPSHOT
- Plant: ${ctx.plantName} (${ctx.species}) — ${ctx.location}
- Health score: ${ctx.healthScore}%
- Soil moisture: ${ctx.moisture}%
- Temperature: ${ctx.temperature}°C
- Light: ${ctx.light} lux, grow lights ${ctx.lightsOn ? "ON" : "OFF"} at ${ctx.lightBrightness}% brightness
- Light time today: ${ctx.lightHours} hours
- Last watered: ${ctx.lastWatered}
- Active automations: ${ctx.activeAutomations.join(", ") || "none"}
- Active alerts: ${ctx.activeAlerts.join(" | ") || "none"}`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...data.messages,
          ],
        }),
      });

      if (!res.ok) {
        if (res.status === 429) return { ok: false, error: "Too many messages. Please wait a moment." };
        if (res.status === 402) return { ok: false, error: "AI credits exhausted. Add credits in workspace settings." };
        return { ok: false, error: "AI couldn't respond. Please try again." };
      }

      const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const reply = json.choices?.[0]?.message?.content?.trim();
      if (!reply) return { ok: false, error: "Empty response from AI." };
      return { ok: true, reply };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Chat failed";
      console.error("askGardenAi error:", msg);
      return { ok: false, error: "Could not reach the AI. Please try again." };
    }
  });