import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const FrameSchema = z.object({
  imageBase64: z.string().min(50),
  takenAt: z.number(),
});

const InputSchema = z.object({
  frames: z.array(FrameSchema).min(2).max(20),
  plantName: z.string().optional(),
  species: z.string().optional(),
});

const AnalysisSchema = z.object({
  growthStage: z.enum(["seedling", "vegetative", "mature", "flowering", "stressed"]),
  canopyCoverChange: z.number().describe("Estimated % change in canopy cover from first to last frame"),
  biomassChange: z.number().describe("Estimated % change in biomass"),
  heightChange: z.number().describe("Estimated relative height change %"),
  healthTrend: z.enum(["improving", "stable", "declining"]),
  observations: z.array(z.string()).max(6),
  recommendations: z.array(z.string()).max(5),
});

export type GrowthAnalysis = z.infer<typeof AnalysisSchema>;

const jsonSchema = {
  type: "object",
  properties: {
    growthStage: { type: "string", enum: ["seedling", "vegetative", "mature", "flowering", "stressed"] },
    canopyCoverChange: { type: "number" },
    biomassChange: { type: "number" },
    heightChange: { type: "number" },
    healthTrend: { type: "string", enum: ["improving", "stable", "declining"] },
    observations: { type: "array", items: { type: "string" } },
    recommendations: { type: "array", items: { type: "string" } },
  },
  required: ["growthStage", "canopyCoverChange", "biomassChange", "heightChange", "healthTrend", "observations", "recommendations"],
  additionalProperties: false,
} as const;

export const analyzeGrowth = createServerFn({ method: "POST" })
  .inputValidator((data) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<{ ok: true; analysis: GrowthAnalysis } | { ok: false; error: string }> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { ok: false, error: "AI service not configured" };

    // Use first and last frame for change comparison to keep payload small.
    const first = data.frames[0];
    const last = data.frames[data.frames.length - 1];
    const days = Math.max(0, (last.takenAt - first.takenAt) / (1000 * 60 * 60 * 24));

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content:
                "You are a plant computer-vision analyst. Compare the two photos of the same plant taken at different times. " +
                "Estimate canopy cover change %, biomass change %, and relative height change %. " +
                "Identify growth stage and health trend. Be conservative with numeric estimates. Reply ONLY through the schema.",
            },
            {
              role: "user",
              content: [
                { type: "text", text: `Plant: ${data.plantName ?? "Unknown"} (${data.species ?? "Unknown species"}). Time between photos: ${days.toFixed(1)} days. ${data.frames.length} total photos in the series.` },
                { type: "text", text: "FIRST photo (earlier):" },
                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${first.imageBase64}` } },
                { type: "text", text: "LAST photo (latest):" },
                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${last.imageBase64}` } },
              ],
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: { name: "growth", strict: true, schema: jsonSchema },
          },
        }),
      });

      if (!res.ok) {
        if (res.status === 429) return { ok: false, error: "Too many requests. Please wait a moment." };
        if (res.status === 402) return { ok: false, error: "AI credits exhausted." };
        return { ok: false, error: "Could not analyze growth. Try again." };
      }

      const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const content = json.choices?.[0]?.message?.content;
      if (!content) return { ok: false, error: "Empty response from AI." };
      const parsed = AnalysisSchema.parse(JSON.parse(content));
      return { ok: true, analysis: parsed };
    } catch (e) {
      console.error("analyzeGrowth error:", e);
      return { ok: false, error: "Could not analyze growth. Try again." };
    }
  });