import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText, Output } from "ai";
import { createLovableAiGatewayProvider } from "./ai-gateway";

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

export const scanLeaf = createServerFn({ method: "POST" })
  .inputValidator((data) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<{ ok: true; diagnosis: Diagnosis } | { ok: false; error: string }> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { ok: false, error: "AI service not configured" };

    try {
      const gateway = createLovableAiGatewayProvider(key);
      const model = gateway("google/gemini-2.5-flash");

      const { experimental_output } = await generateText({
        model,
        output: Output.object({ schema: DiagnosisSchema }),
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
              { type: "image", image: `data:${data.mimeType};base64,${data.imageBase64}` },
            ],
          },
        ],
      });

      return { ok: true, diagnosis: experimental_output };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Scan failed";
      console.error("scanLeaf error:", msg);
      if (msg.includes("429")) return { ok: false, error: "Too many scans. Please wait a moment and try again." };
      if (msg.includes("402")) return { ok: false, error: "AI credits exhausted. Add credits in workspace settings." };
      return { ok: false, error: "Could not analyze the image. Try a clearer photo." };
    }
  });