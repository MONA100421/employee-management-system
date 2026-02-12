import Document from "../models/Document";
import { VISA_FLOW } from "../constants/visaFlow";

export async function validateVisaOrderForUser(userId: string, type: string) {
  if (!VISA_FLOW.includes(type as any)) return { ok: true };

  const docs = await Document.find({
    user: userId,
    type: { $in: VISA_FLOW },
  }).lean();

  const docMap = new Map<string, any>(docs.map((d) => [d.type, d]));

  const currentDoc = docMap.get(type);
  if (currentDoc?.status === "approved") {
    return { ok: false, message: "This step is already approved." };
  }

  const allApproved = VISA_FLOW.every(
    (s) => docMap.get(s)?.status === "approved",
  );
  if (allApproved) {
    return { ok: false, message: "Visa flow already completed and locked." };
  }

  const idx = VISA_FLOW.indexOf(type as any);
  if (idx > 0) {
    const prev = VISA_FLOW[idx - 1];
    const prevDoc = docMap.get(prev);
    if (!prevDoc || prevDoc.status !== "approved") {
      return {
        ok: false,
        message: `Previous step (${prev}) must be approved first.`,
      };
    }
  }

  return { ok: true };
}
