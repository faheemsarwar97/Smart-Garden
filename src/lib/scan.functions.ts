import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  imageBase64: z.string().min(50),
  mimeType: z.string().default("image/jpeg"),
  context: z
    .object({
      plantName: z.string().optional(),
      species: z.string().optional(),
      moisture: z.number().optional(),
      temperature: z.number().optional(),
      light: z.number().optional(),
      lightsOn: z.boolean().optional(),
      lightHours: z.number().optional(),
      lastWatered: z.string().optional(),
      healthScore: z.number().optional(),
      recentAlerts: z.array(z.string()).max(10).optional(),
    })
    .optional(),
});

const DiagnosisSchema = z.object({
  plantGuess: z.string().describe("Best guess at the plant species or 'Unknown'"),
  healthStatus: z.enum(["healthy", "mild", "moderate", "severe"]),
  confidence: z.number().min(0).max(100),
  diagnosis: z.string().describe("Short name of the issue, e.g. 'Leaf spot fungus'"),
  symptoms: z.array(z.string()).max(6),
  causes: z.array(z.string()).max(4),
  treatments: z.array(
    z.object({
      name: z.string(),
      type: z.enum(["organic", "chemical", "cultural"]),
      instructions: z.string(),
    })
  ).max(5),
  prevention: z.array(z.string()).max(5),
  urgency: z.enum(["low", "medium", "high"]),
  historyInsight: z
    .string()
    .describe("Cross-reference of the user's plant history (watering, light, alerts) explaining how it likely contributed. Empty string if no useful link.")
    .default(""),
  nutrients: z.array(
    z.object({
      nutrient: z.enum([
        "Nitrogen",
        "Phosphorus",
        "Potassium",
        "Magnesium",
        "Calcium",
        "Iron",
        "Sulfur",
        "Zinc",
      ]),
      status: z.enum(["deficient", "borderline", "sufficient", "excess"]),
      mobility: z.enum(["mobile", "immobile"]),
      visualPattern: z.string(),
      recommendation: z.string(),
    })
  ).max(8).default([]),
});

export type Diagnosis = z.infer<typeof DiagnosisSchema>;

const jsonSchema = {
  type: "object",
  properties: {
    plantGuess: { type: "string" },
    healthStatus: { type: "string", enum: ["healthy", "mild", "moderate", "severe"] },
    confidence: { type: "number" },
    diagnosis: { type: "string" },
    symptoms: { type: "array", items: { type: "string" } },
    causes: { type: "array", items: { type: "string" } },
    treatments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          type: { type: "string", enum: ["organic", "chemical", "cultural"] },
          instructions: { type: "string" },
        },
        required: ["name", "type", "instructions"],
        additionalProperties: false,
      },
    },
    prevention: { type: "array", items: { type: "string" } },
    urgency: { type: "string", enum: ["low", "medium", "high"] },
    historyInsight: { type: "string" },
    nutrients: {
      type: "array",
      items: {
        type: "object",
        properties: {
          nutrient: {
            type: "string",
            enum: ["Nitrogen", "Phosphorus", "Potassium", "Magnesium", "Calcium", "Iron", "Sulfur", "Zinc"],
          },
          status: { type: "string", enum: ["deficient", "borderline", "sufficient", "excess"] },
          mobility: { type: "string", enum: ["mobile", "immobile"] },
          visualPattern: { type: "string" },
          recommendation: { type: "string" },
        },
        required: ["nutrient", "status", "mobility", "visualPattern", "recommendation"],
        additionalProperties: false,
      },
    },
  },
  required: [
    "plantGuess", "healthStatus", "confidence", "diagnosis",
    "symptoms", "causes", "treatments", "prevention", "urgency",
    "historyInsight", "nutrients",
  ],
  additionalProperties: false,
} as const;

export const scanLeaf = createServerFn({ method: "POST" })
  .inputValidator((data) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<{ ok: true; diagnosis: Diagnosis } | { ok: false; error: string }> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { ok: false, error: "AI service not configured" };

    const ctx = data.context;
    const historyBlock = ctx
      ? `\n\nPLANT HISTORY (cross-reference this against visual symptoms; if a likely cause-effect link exists, explain it in historyInsight, e.g. overwatering 3 days ago -> root rot signs):
- Plant: ${ctx.plantName ?? "Unknown"} (${ctx.species ?? "Unknown species"})
- Health score: ${ctx.healthScore ?? "?"}%
- Soil moisture now: ${ctx.moisture ?? "?"}%
- Temperature: ${ctx.temperature ?? "?"}°C
- Light: ${ctx.light ?? "?"} lux, grow lights ${ctx.lightsOn ? "ON" : "OFF"}, ${ctx.lightHours ?? "?"} h today
- Last watered: ${ctx.lastWatered ?? "?"}
- Recent alerts: ${ctx.recentAlerts?.join(" | ") || "none"}`
      : "";

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
            {
              role: "system",
              content:
                "You are a botanical pathologist and plant nutritionist. Analyze the plant leaf image carefully. " +
                "Identify diseases AND macro/micro nutrient deficiencies (Nitrogen, Phosphorus, Potassium, Magnesium, Calcium, Iron, Sulfur, Zinc) from leaf color/pattern: " +
                "mobile nutrients (N, P, K, Mg) deficiencies appear on OLDER leaves first; immobile (Ca, Fe, S, Zn) on NEW leaves. " +
                "Examples: N -> uniform yellowing of older leaves; P -> purple/red tinge on older leaves; K -> marginal yellowing/scorch on older leaves; Mg -> interveinal chlorosis older leaves; Fe -> interveinal chlorosis NEW leaves. " +
                "Populate the 'nutrients' array with any deficiency you can detect (status/mobility/visualPattern/recommendation). " +
                "If plant history is provided, use it to write 'historyInsight' tying recent watering/light/alerts to current symptoms (e.g. 'Overwatering 3 days ago likely caused this root-rot symptom — let's reduce watering frequency'). Leave historyInsight empty if no clear link. " +
                "If the image is not a plant leaf, set plantGuess='Not a leaf', healthStatus='healthy', confidence 0, nutrients=[], and explain in diagnosis. " +
                "Recommend safe, practical treatments. Include both organic and chemical options where relevant. Be concise." +
                historyBlock,
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Diagnose this leaf, detect any nutrient deficiencies, and recommend medication/treatment. Cross-reference plant history if provided." },
                { type: "image_url", image_url: { url: `data:${data.mimeType};base64,${data.imageBase64}` } },
              ],
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: { name: "diagnosis", strict: true, schema: jsonSchema },
          },
        }),
      });

      if (!res.ok) {
        if (res.status === 429) return { ok: false, error: "Too many scans. Please wait a moment and try again." };
        if (res.status === 402) return { ok: false, error: "AI credits exhausted. Add credits in workspace settings." };
        return { ok: false, error: "Could not analyze the image. Try a clearer photo." };
      }

      const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const content = json.choices?.[0]?.message?.content;
      if (!content) return { ok: false, error: "No response from AI. Please try again." };

      const parsed = DiagnosisSchema.parse(JSON.parse(content));
      return { ok: true, diagnosis: parsed };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Scan failed";
      console.error("scanLeaf error:", msg);
      return { ok: false, error: "Could not analyze the image. Try a clearer photo." };
    }
  });