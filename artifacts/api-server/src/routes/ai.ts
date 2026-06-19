import { Router } from "express";
import { GenerateDescriptionParams, GenerateDescriptionBody } from "@workspace/api-zod";

const router = Router();

function generateTemplateDescription(
  trade: string,
  yearsExperience: number,
  specialties: string[],
  tone: string = "professional"
): string {
  const tradeLabel = trade.charAt(0).toUpperCase() + trade.slice(1);
  const expPhrase =
    yearsExperience > 15
      ? `over ${yearsExperience} years of hands-on experience`
      : yearsExperience > 5
      ? `${yearsExperience} years of professional experience`
      : `${yearsExperience} years in the trade`;

  const specialtyList =
    specialties.length > 1
      ? specialties.slice(0, -1).join(", ") + " and " + specialties[specialties.length - 1]
      : specialties[0] ?? "a wide range of services";

  const tones: Record<string, string[]> = {
    professional: [
      `Licensed and insured ${tradeLabel} with ${expPhrase}, serving residential and commercial clients with pride.`,
      `Specializing in ${specialtyList}, delivering quality workmanship you can depend on.`,
      `Every job — big or small — is completed on time, on budget, and built to last.`,
      `Reach out today for a free estimate and experience the difference that expertise makes.`,
    ],
    friendly: [
      `Hey! I'm a local ${tradeLabel} with ${expPhrase} and a passion for doing things right.`,
      `I love helping homeowners with ${specialtyList} — no job too small, no question too basic.`,
      `I treat every home like it's my own, which means clean work, clear communication, and no nasty surprises.`,
      `Give me a call — I'm always happy to chat and give you a free quote!`,
    ],
    bold: [
      `${expPhrase.charAt(0).toUpperCase() + expPhrase.slice(1)} — that's what separates me from the rest.`,
      `Expert in ${specialtyList}. Fast, reliable, and built to a standard that speaks for itself.`,
      `I don't cut corners. Ever.`,
      `Book me now and find out why my clients keep coming back.`,
    ],
  };

  const lines = tones[tone] ?? tones["professional"]!;
  return lines.join(" ");
}

// POST /providers/:id/generate-description
router.post("/providers/:id/generate-description", async (req, res) => {
  const params = GenerateDescriptionParams.safeParse({ id: Number(req.params.id) });
  const body = GenerateDescriptionBody.safeParse(req.body);
  if (!params.success || !body.success) return res.status(400).json({ error: "Invalid input" });

  const { trade, yearsExperience, specialties, tone } = body.data;

  // Try OpenAI if key is available
  if (process.env.OPENAI_API_KEY) {
    try {
      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const specialtiesText = specialties.join(", ");
      const toneText = tone ?? "professional";

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You write short, compelling professional bios for tradespeople listed on a local services directory. Write in first person. Keep it under 100 words. No bullet points.",
          },
          {
            role: "user",
            content: `Write a ${toneText} bio for a ${trade} with ${yearsExperience} years of experience who specializes in: ${specialtiesText}.`,
          },
        ],
        max_tokens: 200,
      });

      const description = completion.choices[0]?.message?.content?.trim() ?? "";
      if (description) {
        return res.json({ description });
      }
    } catch (err) {
      // Fall through to template
    }
  }

  // Template-based fallback
  const description = generateTemplateDescription(
    trade,
    yearsExperience,
    specialties,
    tone
  );

  return res.json({ description });
});

export default router;
