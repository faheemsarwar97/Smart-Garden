import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  imageBase64: z.string().min(50),
  mimeType: z.string().default("image/jpeg"),
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
  },
  required: [
    "plantGuess", "healthStatus", "confidence", "diagnosis",
    "symptoms", "causes", "treatments", "prevention", "urgency",
  ],
  additionalProperties: false,
} as const;

export const scanLeaf = createServerFn({ method: "POST" })
  .inputValidator((data) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<{ ok: true; diagnosis: Diagnosis } | { ok: false; error: string }> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { ok: false, error: "AI service not configured" };

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
                "You are a botanical pathologist. Analyze the plant leaf image. " +
                "If the image is not a plant leaf, set plantGuess='Not a leaf' and healthStatus='healthy' with confidence 0 and explain in diagnosis. " +
                "Recommend safe, practical treatments. Include both organic and chemical options where relevant. Be concise.",
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Diagnose this leaf and recommend medication/treatment." },
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